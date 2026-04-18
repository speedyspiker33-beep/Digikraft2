<template>
  <div class="min-h-screen bg-gray-900 py-12">
    <h1 class="text-2xl font-bold text-white text-center mb-8">3D D-Shaped Box</h1>
    
    <div class="flex flex-wrap justify-center gap-8">
      <!-- Box 1: Blue D-Shape -->
      <div class="scene">
        <div class="d-box">
          <div class="face front">
            <div class="content">
              <span class="material-symbols-outlined text-4xl text-blue-400">memory</span>
              <p class="text-white font-bold mt-2">DIGITAL</p>
              <p class="text-blue-300 text-xs">PRODUCT</p>
            </div>
          </div>
          <div class="face left">
            <span class="vertical-text">FONT BUNDLE</span>
          </div>
          <div class="face right"></div>
          <div class="face top"></div>
          <div class="face bottom"></div>
          <div class="face back"></div>
        </div>
        <div class="shadow"></div>
      </div>
      
      <!-- Box 2: Purple D-Shape -->
      <div class="scene">
        <div class="d-box d-box-purple">
          <div class="face front">
            <div class="content">
              <span class="material-symbols-outlined text-4xl text-purple-400">web</span>
              <p class="text-white font-bold mt-2">TEMPLATE</p>
              <p class="text-purple-300 text-xs">PACK</p>
            </div>
          </div>
          <div class="face left">
            <span class="vertical-text">TEMPLATE PACK</span>
          </div>
          <div class="face right"></div>
          <div class="face top"></div>
          <div class="face bottom"></div>
          <div class="face back"></div>
        </div>
        <div class="shadow"></div>
      </div>
      
      <!-- Box 3: Green D-Shape -->
      <div class="scene">
        <div class="d-box d-box-green">
          <div class="face front">
            <div class="content">
              <span class="material-symbols-outlined text-4xl text-green-400">emoji_symbols</span>
              <p class="text-white font-bold mt-2">ICON</p>
              <p class="text-green-300 text-xs">SET</p>
            </div>
          </div>
          <div class="face left">
            <span class="vertical-text">ICON SET</span>
          </div>
          <div class="face right"></div>
          <div class="face top"></div>
          <div class="face bottom"></div>
          <div class="face back"></div>
        </div>
        <div class="shadow"></div>
      </div>
      
    </div>
    
    <p class="text-center text-gray-400 mt-12">Interactive 3D D-Shaped boxes with hover effects</p>
  </div>
</template>

<style scoped>
.scene {
  width: 200px;
  height: 260px;
  perspective: 1000px;
}

.d-box {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateY(-25deg) rotateX(5deg);
  transition: transform 0.5s ease;
}

.d-box:hover {
  transform: rotateY(-15deg) rotateX(0deg);
}

.face {
  position: absolute;
}

.front {
  width: 200px;
  height: 260px;
  transform: translateZ(25px);
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 0 20px 20px 0;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 20%, 10% 25%, 10% 75%, 0 80%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.d-box-purple .front {
  background: linear-gradient(135deg, #581c87 0%, #7c3aed 100%);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 20%, 10% 25%, 10% 75%, 0 80%);
}

.d-box-green .front {
  background: linear-gradient(135deg, #14532d 0%, #22c55e 100%);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 20%, 10% 25%, 10% 75%, 0 80%);
}

.content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.left {
  width: 50px;
  height: 260px;
  transform: rotateY(-90deg) translateZ(25px);
  left: -25px;
  background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.d-box-purple .left {
  background: linear-gradient(90deg, #4c1d95 0%, #7c3aed 100%);
}

.d-box-green .left {
  background: linear-gradient(90deg, #166534 0%, #22c55e 100%);
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  color: white;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 2px;
}

.right {
  width: 50px;
  height: 260px;
  transform: rotateY(90deg) translateZ(175px);
  background: linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%);
}

.d-box-purple .right {
  background: linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%);
}

.d-box-green .right {
  background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%);
}

.top {
  width: 200px;
  height: 50px;
  transform: rotateX(90deg) translateZ(25px);
  top: -25px;
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
}

.bottom {
  width: 200px;
  height: 50px;
  transform: rotateX(-90deg) translateZ(235px);
  bottom: -25px;
  background: linear-gradient(0deg, #1e40af 0%, #3b82f6 100%);
}

.back {
  width: 200px;
  height: 260px;
  transform: rotateY(180deg) translateZ(25px);
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
}

.shadow {
  width: 160px;
  height: 30px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  filter: blur(15px);
  margin-top: 20px;
  margin-left: 20px;
  transition: transform 0.5s ease, width 0.5s ease;
}

.d-box:hover + .shadow {
  transform: scale(1.2);
  width: 180px;
}
</style>
