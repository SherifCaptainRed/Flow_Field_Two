const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
canvas.width = 700;
canvas.height = 700;

const zoomSlider = document.getElementById('zoom');
const curveSlider = document.getElementById('curve');
const zoomValue = document.getElementById('zoom-value');
const curveValue = document.getElementById('curve-value');
const gridSizeSlider = document.getElementById('grid-cell-size');
const gridSizeValue = document.getElementById('grid-cell-size-value');

zoomSlider.addEventListener('input', function() {
  effect.zoom = parseFloat(this.value);
  zoomValue.textContent = this.value; // Update the displayed value
  effect.init();
});

curveSlider.addEventListener('input', function() {
  effect.curve = parseFloat(this.value);
  curveValue.textContent = this.value; // Update the displayed value
  effect.init();
});
gridSizeSlider.addEventListener('input', function() {
  effect.cellSize = parseFloat(this.value);
  gridSizeValue.textContent = this.value; // Update the displayed value
  effect.init();
});


function resize(width, height){
  // Get the height of the navbar
  var navbarHeight = document.getElementById('navbar').offsetHeight;

  // Subtract the navbar height from the total height
  this.canvas.width = width;
  this.canvas.height = height - navbarHeight;

  this.width = this.canvas.width;
  this.height = this.canvas.height;

  this.init();
}


//Global Canvas Settings
ctx.fillStyle = 'white';
ctx.strokeStyle = 'white';
ctx.lineWidth = 1;

class Particle{
  constructor(effect){
    this.effect = effect;
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.height);
    this.speedX ;
    this.speedY;
    this.speedModifier = Math.floor(Math.random() * 4);
    this.history = [{x:this.x,y:this.y}];
    this.maxLength = Math.floor(Math.random() * 200 + 10);
    this.angle = 0;
    this.timer = this.maxLength * 2;
    this.colors =['#022840','#025373','#025E73','#037F8C','#F2F2F2'];
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
  }
  draw(context){
    //context.fillRect(this.x, this.y, 10, 10);
    context.beginPath();
    context.moveTo(this.history[0].x,this.history[0].y);
    for(let i = 0; i < this.history.length;i++){
      context.lineTo(this.history[i].x,this.history[i].y);
    }
    context.strokeStyle = this.color;
    context.stroke();
  }
  update(){
    this.timer--;
    if(this.timer >= 1){
      let x = Math.floor(this.x / this.effect.cellSize);
      let y = Math.floor(this.y / this.effect.cellSize);
      let index = y * this.effect.cols + x;
      this.angle = this.effect.flowField[index];

      this.speedX = Math.cos(this.angle);
      this.speedY = Math.sin(this.angle)
      this.x += this.speedX * this.speedModifier;
      this.y += this.speedY * this.speedModifier;

      this.history.push({x:this.x,y:this.y});
      if(this.history.length > this.maxLength){
        this.history.shift();
      }
    }else if(this.history.length > 1){
      this.history.shift();
    }else{
      this.reset();
    }

  }
  reset(){
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.width);
    this.history = [{x:this.x,y:this.y}];
    this.timer = this.maxLength * 2;
  }
}

class Effect{
  constructor(canvas){
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = 2000;
    this.cellSize = 7;
    this.rows;
    this.cols;
    this.flowField = [];
    this.curve = 10;
    this.zoom = 0.1;
    this.debug = false;
    this.init();

    window.addEventListener('keydown', e =>{
      if(e.key === 'd') this.debug = !this.debug;
    });

    // window.addEventListener('resize', e =>{
    //   this.resize(e.target.innerWidth,e.target.innerHeight);
    // });
  }
  init(){
    //vreate Flow Field
    this.rows = Math.floor(this.height/this.cellSize);
    this.cols = Math.floor(this.width/this.cellSize);
    this.flowField = [];
    for(let y = 0; y < this.rows; y++){
      for(let x = 0; x < this.cols; x++){
        let angle = (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.curve;
        this.flowField.push(angle);
      }
    }

    //Create Particle
    this.particles = [];
    for(let i =0; i < this.numberOfParticles; i++){
      this.particles.push(new Particle(this));
    }
  }
  drawGrid(context){
    context.save();
    context.strokeStyle = 'green';
    context.lineWidth = 0.3
    for(let c = 0; c < this.cols; c++){
      context.beginPath();
      context.moveTo(this.cellSize * c,0);
      context.lineTo(this.cellSize * c, this.height);
      context.stroke();
    }
    for(let r = 0; r < this.rows; r++){
      context.beginPath();
      context.moveTo(0,this.cellSize * r);
      context.lineTo( this.width,this.cellSize * r);
      context.stroke();
    }
    context.restore();
  }
  resize(width,height){
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.init();
  }
  render(context){
    if(this.debug) this.drawGrid(context);
    this.particles.forEach(particles => {
      particles.draw(context);
      particles.update();
    });
  }
}

const effect = new Effect(canvas);
// effect.init();
// effect.render(ctx);

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  effect.render(ctx);

  requestAnimationFrame(animate);
}
animate();