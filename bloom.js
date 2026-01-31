let raymarcher;
let rotX = 0;
let rotY = 0;
let prevMouseX, prevMouseY;
let isDragging = false;

let dahlia_value;
let lotus_value;
let camelia_value;

let thickness;
let max_depth;
let field;

let flowerColor;


let myPicker;


function preload() {
  // In p5.js, we'll use a string with the shader code directly
  // You would need to include the shader code as a string in your HTML or load it separately
  // For this example, I'll assume you've loaded it into a variable called 'fragShaderCode'
  raymarcher = loadShader('data/vert.glsl', 'data/frag.glsl');
}


function setup(){
  const cnv = createCanvas(16*35, 16*35, WEBGL);
  cnv.parent('sketch');

  window.setCamelia = setCamelia;
  window.setLotus = setLotus;
  window.setDahlia = setDahlia;
  window.setFlowerColor = setFlowerColor;
  
  flowerColor = color('deeppink');

  camelia_value = 500;
  dahlia_value = 500;
  lotus_value = 500;

  thickness = 0.0;
  max_depth = 300.0;
  field = 0.0;

  shader(raymarcher);
  noStroke();
}

function draw() {

  let lambda_1 = float(camelia_value);
  let lambda_2 = float(lotus_value);
  let lambda_3 = float(dahlia_value);

  let total = lambda_1+lambda_2+lambda_3;

  lambda_1 /= total;
  lambda_2 /= total;
  lambda_3 /= total;

  let A = lambda_1 * (3.14159/2.5) + lambda_2 * (3.14159/2.5) + lambda_3 * (3.14159/1.75);
  let B = lambda_1 * (16.0*3.14159) + lambda_2 * (6.5*3.14159) + lambda_3 * (11.0*3.14159);
  let petalCutA = lambda_1 * 2.75 + lambda_2 * 2.25 + lambda_3 * 4.75;
  let petalCutB = lambda_1 * 80.0 + lambda_2 * 120.0 + lambda_3 * 420.0;
  let petalCutC = (lambda_1 * 480.0 + lambda_2 * 360.0 + lambda_3 * 2000.0)+60.0;
  let basePetalCut = lambda_1 * 0.75 + lambda_2 * 0.5 + lambda_3 * 0.6;
  let hangDownA = lambda_1 * 1.4 + lambda_2 * 2.3 + lambda_3 * 2.3;
  let hangDownB = lambda_1 * 1.0 + lambda_2 * 0.8 + lambda_3 * 0.9;
  let thetaReduction = (lambda_1 * 6000.0 + lambda_2 * 10000.0 + lambda_3 * 20000.0)*3.14159/180.0;

  let r = red(flowerColor) / 255.0;
  let g = green(flowerColor) / 255.0;
  let b = blue(flowerColor) / 255.0;

  raymarcher.setUniform('bColor', [r, g, b]);


  raymarcher.setUniform('iResolution', [width, height]);
  raymarcher.setUniform('iTime', 0.0);// millis() / 1000.0);
  raymarcher.setUniform('rotX', min(rotX-3.14/2.0, 0));
  raymarcher.setUniform('rotY', rotY + millis() / 1000.0);

  raymarcher.setUniform('param', [A, B]);
  raymarcher.setUniform('petalCut', [basePetalCut, petalCutA, petalCutB, petalCutC]);
  raymarcher.setUniform('hangDown', [hangDownA, hangDownB]);
  raymarcher.setUniform('thetaReduction', thetaReduction);

  raymarcher.setUniform('thickness', thickness);
  raymarcher.setUniform('MaxDepth', max_depth);
  raymarcher.setUniform('field', field);


  rect(0, 0, width, height);
}

function mousePressed() {
  if(mouseX < width && mouseY < height && mouseX > 0 && mouseY > 0) {
    isDragging = true;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  }
}

function mouseReleased() {
  isDragging = false;
}

function mouseDragged() {
  if (isDragging) {
    let deltaX = mouseX - prevMouseX;
    let deltaY = mouseY - prevMouseY;
    rotY += deltaX * 0.01;
    rotX += deltaY * 0.01;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  }
}

function setCamelia(val) {
    camelia_value = val;
}

function setLotus(val) {
    lotus_value = val;
}
function setDahlia(val) {
    dahlia_value = val;
}


function setFlowerColor(hexColor) {
  flowerColor = color(hexColor);
}
