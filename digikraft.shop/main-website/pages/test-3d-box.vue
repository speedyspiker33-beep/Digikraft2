<template>
  <div class="min-h-screen bg-gray-100 py-12">
    <h1 class="text-2xl font-bold text-gray-900 mb-12 text-center">3D Product Boxes - Animated</h1>
    
    <div class="flex flex-wrap justify-center gap-20 items-center px-8">
      
      <!-- Box 1: Unfold Animation -->
      <div class="scene">
        <div class="box-container">
          <div class="box" @mouseenter="open1 = true" @mouseleave="open1 = false">
            <!-- Top Lid -->
            <div class="face top-lid" :class="{ 'open': open1 }">
              <span class="material-symbols-outlined text-white text-2xl">auto_awesome</span>
            </div>
            <!-- Front -->
            <div class="face front">
              <div class="content">
                <h1>DIGITAL</h1>
                <h2>PRODUCT</h2>
                <div class="icon">
                  <span class="material-symbols-outlined text-purple-600 text-5xl">text_fields</span>
                </div>
                <div class="badge">50+ FONTS</div>
              </div>
            </div>
            <!-- Back -->
            <div class="face back"></div>
            <!-- Left -->
            <div class="face left"><p>FONT BUNDLE</p></div>
            <!-- Right -->
            <div class="face right"></div>
            <!-- Bottom -->
            <div class="face bottom"></div>
            <!-- Inside contents (revealed on open) -->
            <div class="inside" :class="{ 'reveal': open1 }">
              <div class="item"><span class="material-symbols-outlined text-3xl">font_download</span><span>Serif</span></div>
              <div class="item"><span class="material-symbols-outlined text-3xl">font_download</span><span>Sans</span></div>
              <div class="item"><span class="material-symbols-outlined text-3xl">font_download</span><span>Display</span></div>
            </div>
          </div>
        </div>
        <div class="shadow"></div>
      </div>
      
      <!-- Box 2: Explode Animation -->
      <div class="scene">
        <div class="box-container">
          <div class="box box-purple" @mouseenter="open2 = true" @mouseleave="open2 = false">
            <div class="face top-lid" :class="{ 'open': open2 }">
              <span class="material-symbols-outlined text-white text-2xl">auto_awesome</span>
            </div>
            <div class="face front">
              <div class="content">
                <h1>DIGITAL</h1>
                <h2>PRODUCT</h2>
                <div class="icon">
                  <span class="material-symbols-outlined text-purple-600 text-5xl">web</span>
                </div>
                <div class="badge">100+ TEMPLATES</div>
              </div>
            </div>
            <div class="face back"></div>
            <div class="face left"><p>TEMPLATE PACK</p></div>
            <div class="face right"></div>
            <div class="face bottom"></div>
            <div class="inside" :class="{ 'reveal': open2 }">
              <div class="item"><span class="material-symbols-outlined text-3xl">description</span><span>Business</span></div>
              <div class="item"><span class="material-symbols-outlined text-3xl">description</span><span>Flyers</span></div>
              <div class="item"><span class="material-symbols-outlined text-3xl">description</span><span>Posters</span></div>
            </div>
          </div>
        </div>
        <div class="shadow"></div>
      </div>
      
      <!-- Box 3: Spin Open -->
      <div class="scene">
        <div class="box-container">
          <div class="box box-green" @mouseenter="open3 = true" @mouseleave="open3 = false">
            <div class="face top-lid" :class="{ 'open': open3 }">
              <span class="material-symbols-outlined text-white text-2xl">auto_awesome</span>
            </div>
            <div class="face front">
              <div class="content">
                <h1>DIGITAL</h1>
                <h2>PRODUCT</h2>
                <div class="icon">
                  <span class="material-symbols-outlined text-green-600 text-5xl">emoji_symbols</span>
                </div>
                <div class="badge">500+ ICONS</div>
              </div>
            </div>
            <div class="face back"></div>
            <div class="face left"><p>ICON SET</p></div>
            <div class="face right"></div>
            <div class="face bottom"></div>
            <div class="inside" :class="{ 'reveal': open3 }">
              <div class="item"><span class="material-symbols-outlined text-3xl">tag</span><span>Social</span></div>
              <div class="item"><span class="material-symbols-outlined text-3xl">tag</span><span>Business</span></div>
              <div class="item"><span class="material-symbols-outlined text-3xl">tag</span><span>UI</span></div>
            </div>
          </div>
        </div>
        <div class="shadow"></div>
      </div>
      
    </div>
    
    <p class="text-center text-gray-500 mt-12">Hover over the boxes to see the animation!</p>
  </div>
</template>

<script setup lang="ts">
const open1 = ref(false)
const open2 = ref(false)
const open3 = ref(false)
</script>

<style scoped>
.scene {
  width: 250px;
  height: 350px;
  perspective: 1500px;
}

.box-container {
  width: 100%;
  height: 100%;
}

.box {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateY(-25deg) rotateX(5deg);
  transition: transform 0.6s ease;
}

.box:hover {
  transform: rotateY(-15deg) rotateX(0deg);
}

.face {
  position: absolute;
  border-radius: 8px;
}

.front {
  width: 250px;
  height: 350px;
  transform: translateZ(30px);
  background: linear-gradient(135deg, #f8d7f4 0%, #ffffff 100%);
  box-shadow: inset 0 0 15px rgba(255,255,255,0.5);
}

.back {
  width: 250px;
  height: 350px;
  transform: translateZ(-30px);
  background: linear-gradient(135deg, #e8d4f0 0%, #f0d8f8 100%);
}

.left {
  width: 60px;
  height: 350px;
  transform: rotateY(-90deg) translateZ(30px);
  background: linear-gradient(90deg, #e0d0f0 0%, #d0c0e0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.left p {
  transform: rotate(90deg);
  white-space: nowrap;
  color: #6a5acd;
  font-size: 11px;
  font-weight: bold;
}

.right {
  width: 60px;
  height: 350px;
  transform: rotateY(90deg) translateZ(220px);
  background: linear-gradient(90deg, #f0d8f8 0%, #e8d4f0 100%);
}

.top-lid {
  width: 250px;
  height: 60px;
  transform: rotateX(90deg) translateZ(30px);
  transform-origin: top;
  background: linear-gradient(180deg, #d4a4e0 0%, #c494d0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.6s ease;
  cursor: pointer;
}

.top-lid.open {
  transform: rotateX(90deg) translateZ(30px) rotateX(-110deg);
}

.bottom {
  width: 250px;
  height: 60px;
  transform: rotateX(-90deg) translateZ(320px);
  background: linear-gradient(0deg, #e0c8f0 0%, #d0b8e0 100%);
}

/* Purple variant */
.box-purple .front { background: linear-gradient(135deg, #e7d4f8 0%, #ffffff 100%); }
.box-purple .top-lid { background: linear-gradient(180deg, #c494d0 0%, #b484c0 100%); }
.box-purple .left { background: linear-gradient(90deg, #d0c4e8 0%, #c0b4d8 100%); }
.box-purple .back { background: linear-gradient(135deg, #d4c4e8 0%, #e0d0f0 100%); }
.box-purple .right { background: linear-gradient(90deg, #e0d0f0 0%, #d4c4e8 100%); }

/* Green variant */
.box-green .front { background: linear-gradient(135deg, #d4f8e0 0%, #ffffff 100%); }
.box-green .top-lid { background: linear-gradient(180deg, #a4d4b0 0%, #94c4a0 100%); }
.box-green .left { background: linear-gradient(90deg, #c4e8d0 0%, #b4d8c0 100%); }
.box-green .back { background: linear-gradient(135deg, #c4e8d0 0%, #d0f8e0 100%); }
.box-green .right { background: linear-gradient(90deg, #d0f8e0 0%, #c4e8d0 100%); }

/* Content */
.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.content h1 {
  color: #6a5acd;
  font-size: 26px;
  margin: 25px 0 0;
  font-weight: 900;
}

.content h2 {
  color: #8a7bc7;
  font-size: 20px;
  margin: 0;
  font-weight: 900;
}

.icon {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge {
  background: #6a5acd;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 15px;
}

/* Inside reveal */
.inside {
  position: absolute;
  width: 200px;
  height: 280px;
  top: 35px;
  left: 25px;
  transform: translateZ(10px) scale(0);
  transition: transform 0.5s ease 0.2s;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  border-radius: 8px;
  justify-content: center;
  align-content: center;
}

.inside.reveal {
  transform: translateZ(10px) scale(1);
}

.inside .item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  color: #6a5acd;
  font-size: 10px;
  font-weight: bold;
}

/* Shadow */
.shadow {
  width: 200px;
  height: 40px;
  background: rgba(0,0,0,0.2);
  border-radius: 50%;
  filter: blur(20px);
  margin: 20px auto 0;
  transition: transform 0.5s ease, width 0.5s ease;
}

.box:hover + .shadow {
  transform: scale(1.2);
  width: 220px;
}
</style>
