// 像素渲染引擎
export class PixelRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private pixelSize: number
  private width: number
  private height: number
  
  constructor(canvas: HTMLCanvasElement, pixelSize: number = 4) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.pixelSize = pixelSize
    this.width = canvas.width / pixelSize
    this.height = canvas.height / pixelSize
    
    // 设置像素化渲染
    this.ctx.imageSmoothingEnabled = false
    this.ctx.imageSmoothingEnabled = false
  }
  
  // 清空画布
  clear(color: string = '#F5F5DC') {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }
  
  // 绘制像素点
  drawPixel(x: number, y: number, color: string) {
    this.ctx.fillStyle = color
    this.ctx.fillRect(
      x * this.pixelSize, 
      y * this.pixelSize, 
      this.pixelSize, 
      this.pixelSize
    )
  }
  
  // 绘制像素矩形
  drawRect(x: number, y: number, width: number, height: number, color: string) {
    this.ctx.fillStyle = color
    this.ctx.fillRect(
      x * this.pixelSize,
      y * this.pixelSize,
      width * this.pixelSize,
      height * this.pixelSize
    )
  }
  
  // 绘制像素精灵（从二维数组）
  drawSprite(x: number, y: number, sprite: string[][], palette: Record<string, string>) {
    for (let row = 0; row < sprite.length; row++) {
      for (let col = 0; col < sprite[row].length; col++) {
        const pixel = sprite[row][col]
        if (pixel !== '0' && palette[pixel]) {
          this.drawPixel(x + col, y + row, palette[pixel])
        }
      }
    }
  }
  
  // 绘制文本（像素字体）
  drawText(x: number, y: number, text: string, color: string = '#2C3E50') {
    this.ctx.fillStyle = color
    this.ctx.font = `${this.pixelSize * 3}px monospace`
    this.ctx.fillText(text, x * this.pixelSize, (y + 3) * this.pixelSize)
  }
}

// 宠物精灵数据
export const PetSprites = {
  cat: {
    baby: [
      ['1', '0', '1', '1', '1', '0', '1'],
      ['0', '1', '2', '1', '2', '1', '0'],
      ['1', '1', '1', '1', '1', '1', '1'],
      ['1', '3', '1', '1', '1', '3', '1'],
      ['1', '1', '4', '4', '4', '1', '1'],
      ['0', '1', '1', '1', '1', '1', '0'],
      ['0', '0', '1', '0', '1', '0', '0']
    ],
    adult: [
      ['1', '0', '1', '1', '1', '0', '1'],
      ['1', '1', '2', '1', '2', '1', '1'],
      ['1', '1', '1', '1', '1', '1', '1'],
      ['1', '3', '1', '1', '1', '3', '1'],
      ['1', '1', '4', '4', '4', '1', '1'],
      ['1', '1', '1', '1', '1', '1', '1'],
      ['1', '0', '1', '0', '1', '0', '1']
    ],
    elder: [
      ['1', '0', '1', '1', '1', '0', '1'],
      ['1', '1', '2', '1', '2', '1', '1'],
      ['1', '5', '1', '1', '1', '5', '1'],
      ['1', '3', '1', '1', '1', '3', '1'],
      ['1', '1', '4', '4', '4', '1', '1'],
      ['1', '1', '1', '1', '1', '1', '1'],
      ['1', '0', '1', '0', '1', '0', '1']
    ]
  },
  dog: {
    baby: [
      ['0', '0', '1', '1', '1', '0', '0'],
      ['0', '1', '2', '1', '2', '1', '0'],
      ['1', '1', '1', '1', '1', '1', '1'],
      ['1', '3', '1', '1', '1', '3', '1'],
      ['1', '1', '4', '4', '4', '1', '1'],
      ['0', '1', '1', '1', '1', '1', '0'],
      ['0', '0', '1', '0', '1', '0', '0']
    ],
    adult: [
      ['0', '1', '1', '1', '1', '1', '0'],
      ['1', '2', '1', '1', '1', '2', '1'],
      ['1', '1', '1', '1', '1', '1', '1'],
      ['1', '3', '1', '1', '1', '3', '1'],
      ['1', '1', '4', '4', '4', '1', '1'],
      ['1', '1', '1', '1', '1', '1', '1'],
      ['1', '0', '1', '0', '1', '0', '1']
    ],
    elder: [
      ['0', '1', '1', '1', '1', '1', '0'],
      ['1', '2', '1', '1', '1', '2', '1'],
      ['1', '5', '1', '1', '1', '5', '1'],
      ['1', '3', '1', '1', '1', '3', '1'],
      ['1', '1', '4', '4', '4', '1', '1'],
      ['1', '1', '1', '1', '1', '1', '1'],
      ['1', '0', '1', '0', '1', '0', '1']
    ]
  },
  rabbit: {
    baby: [
      ['0', '1', '0', '0', '0', '1', '0'],
      ['1', '1', '1', '0', '1', '1', '1'],
      ['1', '2', '1', '1', '1', '2', '1'],
      ['1', '1', '1', '1', '1', '1', '1'],
      ['1', '3', '1', '1', '1', '3', '1'],
      ['1', '1', '4', '4', '4', '1', '1'],
      ['0', '1', '1', '1', '1', '1', '0']
    ],
    adult: [
      ['1', '1', '0', '0', '0', '1', '1'],
      ['1', '1', '1', '0', '1', '1', '1'],
      ['1', '2', '1', '1', '1', '2', '1'],
      ['1', '1', '1', '1', '1', '1', '1'],
      ['1', '3', '1', '1', '1', '3', '1'],
      ['1', '1', '4', '4', '4', '1', '1'],
      ['1', '1', '1', '1', '1', '1', '1']
    ],
    elder: [
      ['1', '1', '0', '0', '0', '1', '1'],
      ['1', '1', '1', '0', '1', '1', '1'],
      ['1', '2', '1', '1', '1', '2', '1'],
      ['1', '5', '1', '1', '1', '5', '1'],
      ['1', '3', '1', '1', '1', '3', '1'],
      ['1', '1', '4', '4', '4', '1', '1'],
      ['1', '1', '1', '1', '1', '1', '1']
    ]
  },
  bird: {
    baby: [
      ['0', '0', '6', '6', '6', '0', '0'],
      ['0', '6', '7', '6', '7', '6', '0'],
      ['6', '6', '6', '6', '6', '6', '6'],
      ['6', '3', '6', '6', '6', '3', '6'],
      ['6', '6', '8', '8', '8', '6', '6'],
      ['0', '6', '6', '6', '6', '6', '0'],
      ['0', '0', '6', '0', '6', '0', '0']
    ],
    adult: [
      ['0', '6', '6', '6', '6', '6', '0'],
      ['6', '7', '6', '6', '6', '7', '6'],
      ['6', '6', '6', '6', '6', '6', '6'],
      ['6', '3', '6', '6', '6', '3', '6'],
      ['6', '6', '8', '8', '8', '6', '6'],
      ['6', '6', '6', '6', '6', '6', '6'],
      ['6', '0', '6', '0', '6', '0', '6']
    ],
    elder: [
      ['0', '6', '6', '6', '6', '6', '0'],
      ['6', '7', '6', '6', '6', '7', '6'],
      ['6', '5', '6', '6', '6', '5', '6'],
      ['6', '3', '6', '6', '6', '3', '6'],
      ['6', '6', '8', '8', '8', '6', '6'],
      ['6', '6', '6', '6', '6', '6', '6'],
      ['6', '0', '6', '0', '6', '0', '6']
    ]
  },
  hamster: {
    baby: [
      ['0', '0', '9', '9', '9', '0', '0'],
      ['0', '9', '2', '9', '2', '9', '0'],
      ['9', '9', '9', '9', '9', '9', '9'],
      ['9', '3', '9', '9', '9', '3', '9'],
      ['9', '9', '4', '4', '4', '9', '9'],
      ['0', '9', '9', '9', '9', '9', '0'],
      ['0', '0', '9', '0', '9', '0', '0']
    ],
    adult: [
      ['0', '9', '9', '9', '9', '9', '0'],
      ['9', '2', '9', '9', '9', '2', '9'],
      ['9', '9', '9', '9', '9', '9', '9'],
      ['9', '3', '9', '9', '9', '3', '9'],
      ['9', '9', '4', '4', '4', '9', '9'],
      ['9', '9', '9', '9', '9', '9', '9'],
      ['9', '0', '9', '0', '9', '0', '9']
    ],
    elder: [
      ['0', '9', '9', '9', '9', '9', '0'],
      ['9', '2', '9', '9', '9', '2', '9'],
      ['9', '5', '9', '9', '9', '5', '9'],
      ['9', '3', '9', '9', '9', '3', '9'],
      ['9', '9', '4', '4', '4', '9', '9'],
      ['9', '9', '9', '9', '9', '9', '9'],
      ['9', '0', '9', '0', '9', '0', '9']
    ]
  },
  fish: {
    baby: [
      ['0', '0', 'A', 'A', 'A', '0', '0'],
      ['0', 'A', 'B', 'A', 'B', 'A', '0'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', '3', 'A', 'A', 'A', '3', 'A'],
      ['A', 'A', 'C', 'C', 'C', 'A', 'A'],
      ['0', 'A', 'A', 'A', 'A', 'A', '0'],
      ['0', '0', 'A', '0', 'A', '0', '0']
    ],
    adult: [
      ['0', 'A', 'A', 'A', 'A', 'A', '0'],
      ['A', 'B', 'A', 'A', 'A', 'B', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', '3', 'A', 'A', 'A', '3', 'A'],
      ['A', 'A', 'C', 'C', 'C', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', '0', 'A', '0', 'A', '0', 'A']
    ],
    elder: [
      ['0', 'A', 'A', 'A', 'A', 'A', '0'],
      ['A', 'B', 'A', 'A', 'A', 'B', 'A'],
      ['A', '5', 'A', 'A', 'A', '5', 'A'],
      ['A', '3', 'A', 'A', 'A', '3', 'A'],
      ['A', 'A', 'C', 'C', 'C', 'A', 'A'],
      ['A', 'A', 'A', 'A', 'A', 'A', 'A'],
      ['A', '0', 'A', '0', 'A', '0', 'A']
    ]
  }
}

// 颜色调色板
export const ColorPalette = {
  '1': '#8B4513', // 棕色（猫狗身体）
  '2': '#FFB6C1', // 粉色（耳朵内侧）
  '3': '#000000', // 黑色（眼睛）
  '4': '#FF69B4', // 粉红色（鼻子）
  '5': '#FFFFFF', // 白色（兔子耳朵）
  '6': '#FFD700', // 金黄色（小鸟身体）
  '7': '#FFA500', // 橙色（小鸟翅膀）
  '8': '#FF8C00', // 深橙色（小鸟嘴巴）
  '9': '#DEB887', // 浅棕色（仓鼠身体）
  'A': '#FF6347', // 橙红色（金鱼身体）
  'B': '#FFB6C1', // 粉色（金鱼鳍）
  'C': '#FF4500', // 红橙色（金鱼嘴巴）
}

// 宠物动画类
export class PetAnimation {
  private renderer: PixelRenderer
  private currentFrame: number = 0
  private animationSpeed: number = 200 // 毫秒，提高帧率
  private lastFrameTime: number = 0
  private isPlaying: boolean = false
  private animationState: 'idle' | 'happy' | 'sleeping' | 'eating' | 'playing' | 'sick' | 'cleaning' = 'idle'
  private x: number = 6
  private y: number = 4
  private stateTimer: number = 0
  private stateDuration: number = 3000 // 状态持续时间
  
  constructor(renderer: PixelRenderer) {
    this.renderer = renderer
  }
  
  // 播放待机动画
  playIdleAnimation(pet: any) {
    this.isPlaying = true
    this.currentFrame = 0
    this.stateTimer = 0
    
    const animate = () => {
      if (!this.isPlaying) return
      
      this.renderer.clear()
      
      // 更新状态计时器
      this.stateTimer += this.animationSpeed
      
      // 随机切换动画状态
      if (this.stateTimer >= this.stateDuration) {
        const states: Array<'idle' | 'happy' | 'sleeping' | 'eating' | 'playing'> = ['idle', 'happy', 'sleeping', 'eating', 'playing']
        this.animationState = states[Math.floor(Math.random() * states.length)]
        this.stateTimer = 0
        this.stateDuration = 2000 + Math.random() * 4000 // 2-6秒随机持续时间
      }
      
      this.drawAnimatedSprite(pet)
      
      this.currentFrame++
      this.lastFrameTime = Date.now()
      
      if (this.isPlaying) {
        setTimeout(() => requestAnimationFrame(animate), this.animationSpeed)
      }
    }
    
    animate()
  }
  
  // 绘制带动画效果的精灵
  private drawAnimatedSprite(pet: any) {
    const x = 6
    const y = 4
    let offsetX = 0
    let offsetY = 0
    
    // 根据年龄确定生命阶段
    let lifeStage: string
    if (pet.age < 30) {
      lifeStage = 'baby'
    } else if (pet.age < 60) {
      lifeStage = 'adult'
    } else {
      lifeStage = 'elder'
    }
    
    const petType = pet.type as keyof typeof PetSprites
    const petSprites = PetSprites[petType]
    const sprite = petSprites?.[lifeStage as keyof typeof petSprites]
    
    if (!sprite) {
      // 如果找不到精灵，绘制一个简单的占位符
      this.renderer.drawRect(6, 4, 7, 7, '#8B4513')
      this.renderer.drawRect(7, 5, 2, 2, '#000000') // 眼睛
      this.renderer.drawRect(10, 5, 2, 2, '#000000') // 眼睛
      this.renderer.drawRect(8, 7, 3, 1, '#FF69B4') // 嘴巴
      return
    }
    
    switch (this.animationState) {
      case 'idle':
        // 轻微的上下浮动
        offsetY = Math.sin(this.currentFrame * 0.2) * 1.5
        // 偶尔眨眼效果
        if (this.currentFrame % 60 < 3) {
          this.renderer.drawSprite(x + offsetX, y + offsetY, sprite, ColorPalette)
          // 绘制闭眼效果
          this.renderer.drawRect(x + 1, y + 3, 2, 1, ColorPalette['1'])
          this.renderer.drawRect(x + 4, y + 3, 2, 1, ColorPalette['1'])
          return
        }
        break
      case 'sick':
        // 生病时的虚弱动画
        offsetY = Math.sin(this.currentFrame * 0.1) * 0.8
        offsetX = Math.sin(this.currentFrame * 0.15) * 0.5
        this.renderer.drawSprite(x + offsetX, y + offsetY, sprite, ColorPalette)
        // 添加病态效果 - 绿色气泡
        if (this.currentFrame % 50 < 25) {
          this.renderer.drawRect(x + 7, y - 1, 1, 1, '#90EE90')
          this.renderer.drawRect(x + 9, y - 2, 1, 1, '#90EE90')
          this.renderer.drawRect(x + 6, y - 3, 1, 1, '#90EE90')
        }
        return
      case 'cleaning':
        // 清洁时的整理动画
        offsetX = Math.sin(this.currentFrame * 0.4) * 1.5
        offsetY = Math.sin(this.currentFrame * 0.3) * 0.8
        this.renderer.drawSprite(x + offsetX, y + offsetY, sprite, ColorPalette)
        // 添加清洁效果 - 闪亮星星
        const sparklePositions = [
          [x - 1, y + 2], [x + 8, y + 1], [x + 2, y - 1], [x + 6, y + 7]
        ]
        for (let i = 0; i < sparklePositions.length; i++) {
          if ((this.currentFrame + i * 10) % 40 < 20) {
            this.renderer.drawRect(sparklePositions[i][0], sparklePositions[i][1], 1, 1, '#FFD700')
          }
        }
        return
        break
      case 'happy':
        // 快乐时的跳跃动画
        offsetY = Math.abs(Math.sin(this.currentFrame * 0.4)) * -3
        // 添加爱心效果
        this.renderer.drawSprite(x + offsetX, y + offsetY, sprite, ColorPalette)
        if (this.currentFrame % 20 < 10) {
          this.renderer.drawRect(x + 8, y - 2, 1, 1, '#FF69B4')
          this.renderer.drawRect(x + 10, y - 2, 1, 1, '#FF69B4')
          this.renderer.drawRect(x + 9, y - 1, 1, 1, '#FF69B4')
        }
        return
      case 'sleeping':
        // 睡觉时的缓慢呼吸动画
        offsetY = Math.sin(this.currentFrame * 0.1) * 0.5
        // 添加Z字睡眠效果
        this.renderer.drawSprite(x + offsetX, y + offsetY, sprite, ColorPalette)
        if (this.currentFrame % 40 < 20) {
          this.renderer.drawText(x + 8, y - 3, 'Z', '#87CEEB')
          if (this.currentFrame % 40 < 10) {
            this.renderer.drawText(x + 10, y - 5, 'z', '#87CEEB')
          }
        }
        return
      case 'eating':
        // 进食时的动画
        offsetY = Math.sin(this.currentFrame * 0.3) * 1
        this.renderer.drawSprite(x + offsetX, y + offsetY, sprite, ColorPalette)
        // 添加食物效果
        if (this.currentFrame % 30 < 15) {
          this.renderer.drawRect(x - 2, y + 6, 2, 2, '#FFD700')
        }
        return
      case 'playing':
        // 玩耍时的动画
        offsetX = Math.sin(this.currentFrame * 0.5) * 2
        offsetY = Math.abs(Math.sin(this.currentFrame * 0.6)) * -2
        this.renderer.drawSprite(x + offsetX, y + offsetY, sprite, ColorPalette)
        // 添加玩具球效果
        if (this.currentFrame % 25 < 12) {
          this.renderer.drawRect(x + 8, y + 8, 2, 2, '#FF4500')
        }
        return
    }
    
    this.renderer.drawSprite(x + offsetX, y + offsetY, sprite, ColorPalette)
  }
  
  // 播放互动动画
  playInteractionAnimation(pet: any, interactionType: string) {
    this.isPlaying = true;
    this.currentFrame = 0;
    
    const animate = () => {
      if (!this.isPlaying) return;
      
      this.renderer.clear();
      
      const petType = pet.type as keyof typeof PetSprites;
      let lifeStage: string;
      
      // 根据年龄确定生命阶段
      if (pet.age < 30) {
        lifeStage = 'baby';
      } else if (pet.age < 60) {
        lifeStage = 'adult';
      } else {
        lifeStage = 'elder';
      }
      
      const sprite = PetSprites[petType]?.[lifeStage as keyof typeof PetSprites[typeof petType]];
      
      if (sprite) {
        let offsetX = 0;
        let offsetY = 0;
        
        // 根据互动类型添加效果
        switch (interactionType) {
          case 'touch':
            // 触摸效果 - 轻微震动和闪烁
            offsetX = (Math.random() - 0.5) * 2;
            offsetY = (Math.random() - 0.5) * 2;
            this.renderer.drawSprite(6 + offsetX, 4 + offsetY, sprite, ColorPalette);
            if (this.currentFrame % 8 < 4) {
              this.renderer.drawRect(6, 4, sprite[0].length, sprite.length, 'rgba(255, 255, 255, 0.4)');
            }
            break;
          
          case 'feed':
            // 喂食效果 - 上下点头和食物
            offsetY = Math.sin(this.currentFrame * 0.4) * 1;
            this.renderer.drawSprite(6, 4 + offsetY, sprite, ColorPalette);
            // 食物效果
            if (this.currentFrame % 20 < 10) {
              this.renderer.drawRect(2, 10, 2, 2, '#FFD700'); // 食物
              this.renderer.drawRect(3, 9, 1, 1, '#FFA500'); // 食物装饰
            }
            break;
          
          case 'clean':
            // 清洁效果 - 左右摇摆和泡泡
            offsetX = Math.sin(this.currentFrame * 0.3) * 1;
            this.renderer.drawSprite(6 + offsetX, 4, sprite, ColorPalette);
            // 泡泡效果
            const bubblePositions = [
              [2, 2], [16, 3], [3, 1], [15, 2], [4, 3], [14, 1]
            ];
            for (let i = 0; i < bubblePositions.length; i++) {
              if ((this.currentFrame + i * 5) % 30 < 15) {
                this.renderer.drawRect(bubblePositions[i][0], bubblePositions[i][1], 1, 1, '#87CEEB');
              }
            }
            break;
          
          case 'play':
            // 玩耍效果 - 跳跃
            const jumpHeight = Math.abs(Math.sin(this.currentFrame * 0.25)) * -3;
            this.renderer.drawSprite(6, 4 + jumpHeight, sprite, ColorPalette);
            // 玩具球
            if (this.currentFrame % 30 < 15) {
              this.renderer.drawRect(15, 10, 2, 2, '#FF4500'); // 玩具球
              this.renderer.drawRect(16, 9, 1, 1, '#FFD700'); // 玩具装饰
            }
            break;
          
          case 'gift':
            // 送礼效果 - 兴奋跳跃和礼物
            offsetY = Math.abs(Math.sin(this.currentFrame * 0.4)) * -2;
            this.renderer.drawSprite(6, 4 + offsetY, sprite, ColorPalette);
            // 礼物盒动画
            const giftScale = 1 + Math.sin(this.currentFrame * 0.3) * 0.1;
            this.renderer.drawRect(2, 11, 3, 3, '#8B4513'); // 礼品盒
            this.renderer.drawRect(3, 10, 1, 1, '#FFD700'); // 蝴蝶结
            this.renderer.drawRect(2, 10, 1, 1, '#FFD700'); // 蝴蝶结
            this.renderer.drawRect(4, 10, 1, 1, '#FFD700'); // 蝴蝶结
            break;
          
          case 'sing':
            // 唱歌效果 - 节拍摇摆和音符
            offsetX = Math.sin(this.currentFrame * 0.5) * 1;
            offsetY = Math.sin(this.currentFrame * 0.3) * 0.5;
            this.renderer.drawSprite(6 + offsetX, 4 + offsetY, sprite, ColorPalette);
            // 音符效果
            const notePositions = [
              [15, 1], [17, 2], [14, 3], [18, 4], [16, 0], [13, 2]
            ];
            for (let i = 0; i < notePositions.length; i++) {
              if ((this.currentFrame + i * 8) % 40 < 20) {
                this.renderer.drawRect(notePositions[i][0], notePositions[i][1], 1, 1, '#9370DB');
              }
            }
            break;
            
          default:
            this.renderer.drawSprite(6, 4, sprite, ColorPalette);
        }
      }
      
      this.currentFrame++;
      
      if (this.currentFrame < 80) { // 4秒动画
        requestAnimationFrame(animate);
      } else {
        this.isPlaying = false;
         this.playIdleAnimation(pet); // 回到待机动画
      }
    };
    
    animate();
  }

  // 停止动画
  stop() {
    this.isPlaying = false
  }
  
  // 设置动画状态
  setAnimationState(state: 'idle' | 'happy' | 'sleeping' | 'eating' | 'playing' | 'sick' | 'cleaning') {
    this.animationState = state
  }
  
  // 获取当前动画状态
  getAnimationState() {
    return this.animationState
  }
}