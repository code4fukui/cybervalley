
export const setGalaxy = async (canvas) => {
  if (!navigator.gpu) {
    throw new Error("WebGPU not supported");
  }

  const adapter = await navigator.gpu.requestAdapter();
  const device  = await adapter.requestDevice();

  const context = canvas.getContext("webgpu");
  //const format = navigator.gpu.getPreferredCanvasFormat();
  const format = "rgba16float";
  const toneMapping = { mode: "extended" };

  function resize() {
    const dpr = Math.max(1, Math.min(2, devicePixelRatio || 1));
    const w = Math.floor(canvas.clientWidth  * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    canvas.width = w; canvas.height = h;
    context.configure({ device, format, toneMapping, alphaMode: "opaque" });
  }
  addEventListener("resize", resize);
  resize();

  // ---- interaction
  let pointer = {x:0, y:0, down:false};
  let zoom = 3.5;

  canvas.addEventListener("pointerdown", e => { pointer.down = true; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointerup",   e => { pointer.down = false; });
  canvas.addEventListener("pointermove", e => {
    const r = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width  * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height * 2 - 1);
  });
  canvas.addEventListener("wheel", e => {
    e.preventDefault();
    const s = Math.exp(-e.deltaY * 0.001);
    zoom = Math.max(0.25, Math.min(4.0, zoom * s));
  }, {passive:false});

  // mouse emulation
  const rnd = Math.random();
  setInterval(() => {
    const t = performance.now();
    const r = 0.5;
    const l = 1500;
    pointer.x = Math.cos(t / (l / 3 + rnd / 10)) * r;
    pointer.y = Math.sin(t / (l / 4)) * r;
    pointer.down = Math.floor(t / l) % 2 == 0;
  }, 100);

  // ---- particles
  const N = 100_000;          // 重ければ下げて
  const particleStride = 8;   // pos4 + vel4
  const particleBytes = N * particleStride * 4;

  const particles = device.createBuffer({
    size: particleBytes,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  {
    const init = new Float32Array(N * particleStride);
    for (let i=0;i<N;i++){
      const a = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.65) * 0.9;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      init[i*particleStride+0]=x;
      init[i*particleStride+1]=y;
      init[i*particleStride+2]=0;
      init[i*particleStride+3]=1;

      const t = 0.4 + Math.random()*0.6;
      init[i*particleStride+4]= -Math.sin(a) * t * 0.25;
      init[i*particleStride+5]=  Math.cos(a) * t * 0.25;
      init[i*particleStride+6]=0;
      init[i*particleStride+7]=0;
    }
    device.queue.writeBuffer(particles, 0, init);
  }

  const uniforms = device.createBuffer({
    size: 8 * 4, // 8 floats
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // ---- WGSL (compute: read_write)
  const wgslCompute = /* wgsl */`
  struct Particle { pos: vec4f, vel: vec4f };

  struct U0 {
    time_dt_aspect_zoom : vec4f,
    pointer_xy_down_pad : vec4f,
  };

  @group(0) @binding(0) var<storage, read_write> P : array<Particle>;
  @group(0) @binding(1) var<uniform> U : U0;

  fn hash2(p: vec2f) -> vec2f {
    let h1 = fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
    let h2 = fract(sin(dot(p, vec2f(269.5, 183.3))) * 43758.5453);
    return vec2f(h1, h2);
  }

  @compute @workgroup_size(256)
  fn cs(@builtin(global_invocation_id) gid : vec3u) {
    let i = gid.x;
    if (i >= arrayLength(&P)) { return; }

    let t  = U.time_dt_aspect_zoom.x;
    let dt = U.time_dt_aspect_zoom.y;

    var pos = P[i].pos.xy;
    var vel = P[i].vel.xy;

    let r2 = max(1e-4, dot(pos,pos));
    let r  = sqrt(r2);
    let toCenter = -pos / r;
    let swirlDir = vec2f(-pos.y, pos.x) / r;

    let n = (hash2(pos*13.7 + vec2f(t*0.05, -t*0.03)) - 0.5) * 2.0;

    let pxy = U.pointer_xy_down_pad.xy;
    let down = U.pointer_xy_down_pad.z;
    let d = pxy - pos;
    let md2 = max(1e-4, dot(d,d));
    let md  = sqrt(md2);
    let mdir = d / md;
    let msw  = vec2f(-mdir.y, mdir.x);

    let centerPull = toCenter * 0.35;
    let swirl      = swirlDir * (0.55 + 0.25*sin(t*0.7 + r*8.0));
    let jitter     = n * 0.12;

    let mouseForce = down * (mdir * 0.9 / (1.0 + md2*6.0) + msw * 0.8 / (1.0 + md2*8.0));

    vel *= exp(-dt * 0.75);
    vel += (centerPull + swirl + jitter + mouseForce) * dt;

    let sp = length(vel);
    if (sp > 2.0) { vel = vel / sp * 2.0; }

    pos += vel * dt;

    if (length(pos) > 1.25) {
      pos *= 0.85;
      vel *= 0.5;
    }

    P[i].pos = vec4f(pos, 0.0, 1.0);
    P[i].vel = vec4f(vel, 0.0, 0.0);
  }
  `;

  // ---- WGSL (render: read only)
  const wgslRender = /* wgsl */`
  struct Particle { pos: vec4f, vel: vec4f };

  struct U0 {
    time_dt_aspect_zoom : vec4f,
    pointer_xy_down_pad : vec4f,
  };

  @group(0) @binding(0) var<storage, read> P : array<Particle>;
  @group(0) @binding(1) var<uniform> U : U0;

  struct VSOut {
    @builtin(position) pos : vec4f,
    @location(0) r : f32,
  };

  fn rotX(p: vec3f, a: f32) -> vec3f {
    let c = cos(a);
    let s = sin(a);
    return vec3f(p.x, c*p.y - s*p.z, s*p.y + c*p.z);
  }

  @vertex
  fn vs(@builtin(vertex_index) vi : u32) -> VSOut {
    let aspect = U.time_dt_aspect_zoom.z;
    let zoom   = U.time_dt_aspect_zoom.w;

    let p0 = P[vi].pos.xyz;
    let p = p0 * zoom;

    // 銀河円盤を傾ける
    let tilt = 1.1;
    let p1 = rotX(p0, tilt);

    // 簡易カメラ(Z+方向にカメラ、原点を見る)
    // view space: zが大きいほど奥、として透視
    let camD = 2.6;
    let z = (camD - p1.z);
    let invZ = 1.0 / max(0.15, z);
    let x = p1.x * zoom * invZ;
    let y = p1.y * zoom * invZ;

    var out : VSOut;
    //let clip = vec2f(p.x / aspect, p.y);
    let clip = vec2f(x / aspect, y);
    out.pos = vec4f(clip, 0.0, 1.0);

    out.r = clamp(1.0 - length(p0), 0.0, 1.0);
    //out.r = U.time_dt_aspect_zoom.x;

    return out;
  }

  fn hsv2rgb(c: vec3f) -> vec3f {
    let K = vec4f(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    let p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, vec3f(0.0), vec3f(1.0)), c.y);
  }

  @fragment
  fn fs(in: VSOut) -> @location(0) vec4f {
    /*
    let l = 5.0;
    let t = in.r % 1.0;
    //return vec4f(l, t, l, 1.0);
    let col=mix(
      vec3f(0.6, 0.9, 0.7),
      vec3f(1.6, 1.6, 1.6),
      vec3f(5.0, 5.0, 5.0)
    );

    return vec4f(col * t, 1.0); // ★ HDR値そのまま出す
    */

    let sparkle = 20.0;
    // 中心(core)と時間で hue を変える
    let hue =
        fract(
          0.15            // ベース色(黄緑寄り)
        //+ t * 0.03        // ★ 時間でゆっくり回転
        + in.r * 0.35   // 中心ほど色が変わる
        );

    let sat = mix(0.6, 0.75, sparkle); // キラッ時に彩度UP
    let val = .5;

    let col = hsv2rgb(vec3f(hue, sat, val));

    // ---- HDR 出力 ----
    return vec4f(col * 2.0, 1.0);
  }
  `;

  const smCompute = device.createShaderModule({ code: wgslCompute });
  const smRender  = device.createShaderModule({ code: wgslRender  });

  // ---- bind group layouts (compute / render 分離)
  const bglCompute = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } }, // read_write
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform" } },
    ],
  });
  const bglRender = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" } }, // read only
      { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" } },
    ],
  });

  const bgCompute = device.createBindGroup({
    layout: bglCompute,
    entries: [
      { binding: 0, resource: { buffer: particles } },
      { binding: 1, resource: { buffer: uniforms } },
    ],
  });
  const bgRender = device.createBindGroup({
    layout: bglRender,
    entries: [
      { binding: 0, resource: { buffer: particles } },
      { binding: 1, resource: { buffer: uniforms } },
    ],
  });

  // ---- pipelines
  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bglCompute] }),
    compute: { module: smCompute, entryPoint: "cs" },
  });

  const renderPipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bglRender] }),
    vertex: { module: smRender, entryPoint: "vs" },
    fragment: {
      module: smRender, entryPoint: "fs",
      targets: [{
        format,
        blend: {
          color: { operation: "add", srcFactor: "one", dstFactor: "one" },
          alpha: { operation: "add", srcFactor: "one", dstFactor: "one" },
        },
      }],
    },
    primitive: { topology: "point-list" },
  });

  // ---- loop
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    const aspect = canvas.width / canvas.height;

    const u = new Float32Array(8);
    u[0] = now / 1000;
    u[1] = dt;
    u[2] = aspect;
    u[3] = zoom;
    u[4] = pointer.x;
    u[5] = pointer.y;
    u[6] = pointer.down ? 1 : 0;
    u[7] = 0;
    device.queue.writeBuffer(uniforms, 0, u);

    const encoder = device.createCommandEncoder();

    // compute
    {
      const pass = encoder.beginComputePass();
      pass.setPipeline(computePipeline);
      pass.setBindGroup(0, bgCompute);
      pass.dispatchWorkgroups(Math.ceil(N / 256));
      pass.end();
    }

    // render
    {
      const view = context.getCurrentTexture().createView();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        }],
      });
      pass.setPipeline(renderPipeline);
      pass.setBindGroup(0, bgRender);
      pass.draw(N, 1, 0, 0);
      pass.end();
    }

    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
};
