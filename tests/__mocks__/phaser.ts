// TypeScript Phaser mock for Jest
export class Vector2 {
  x: number; y: number
  constructor(x = 0, y = 0) { this.x = x; this.y = y }
  clone() { return new Vector2(this.x, this.y) }
  subtract(v: Vector2) { this.x -= v.x; this.y -= v.y; return this }
  add(v: Vector2) { this.x += v.x; this.y += v.y; return this }
  scale(s: number) { this.x *= s; this.y *= s; return this }
  normalize() { const l = Math.sqrt(this.x*this.x + this.y*this.y) || 1; this.x /= l; this.y /= l; return this }
  length() { return Math.sqrt(this.x*this.x + this.y*this.y) }
  distance(v: Vector2) { return Math.hypot(v.x - this.x, v.y - this.y) }
  dot(v: Vector2) { return this.x * v.x + this.y * v.y }
  rotate(rad: number) { const c=Math.cos(rad), s=Math.sin(rad); const x=this.x*c - this.y*s; const y=this.x*s + this.y*c; this.x=x; this.y=y; return this }
  lerp(to: Vector2, t: number) { this.x = this.x + (to.x - this.x)*t; this.y = this.y + (to.y - this.y)*t; return this }
}

export const MathNS = {
  Between: (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1)),
  FloatBetween: (min: number, max: number) => min + Math.random() * (max - min),
  Clamp: (v: number, min: number, max: number) => Math.max(min, Math.min(max, v)),
  Distance: { Between: (x1: number,y1: number,x2: number,y2: number) => Math.hypot(x2-x1, y2-y1) },
  Vector2,
  Angle: { Between: (x1:number,y1:number,x2:number,y2:number)=>Math.atan2(y2-y1, x2-x1), ShortestBetween: (a:number,b:number)=>b-a },
  RadToDeg: (r:number)=> (r*180/Math.PI),
  DegToRad: (d:number)=> (d*Math.PI/180),
}

export const Display = {
  Color: { HexStringToColor: (hex?: string) => ({ color: parseInt((hex||'#000000').replace('#',''), 16) }) }
}

export const Input = { Keyboard: { KeyCodes: { SPACE: 32 } } }

export const BlendModes = { ADD: 'ADD' }

class GameObject {
  active = true; x = 0; y = 0; data = new Map<string, any>(); body: any
  setDepth() { return this } setBlendMode() { return this } setDisplaySize() { return this }
  setAlpha() { return this } setVisible() { return this } setTint() { return this }
  setOrigin() { return this } setInteractive() { ;(this as any).on = jest.fn().mockReturnThis(); return this }
  setSize() { return this } setRotation() { return this }
  setTexture(_t?: string) { return this }
  setData(key: string, val: any) { this.data.set(key, val); return this } getData(key: string) { return this.data.get(key) }
  destroy() { this.active = false }
}
class Image extends GameObject {}
export class Text extends GameObject { text = ''; style: any = {}; constructor(x:number,y:number,t:string,s?:any){ super(); this.x=x; this.y=y; this.text=t; this.style=s||{} } setText(t:string){ this.text=t; return this } }
export class Container extends GameObject { constructor(x=0,y=0){ super(); this.x=x; this.y=y; this.body=null as any } add(){ return this } }
class Graphics extends GameObject { clear(){return this} fillStyle(){return this} fillRoundedRect(){return this} generateTexture(){return this} fillCircle(){return this} lineStyle(){return this} strokeCircle(){return this} }
class Group { children = { entries: [] as any[], each: (cb: Function, ctx: any)=>{ this.children.entries.forEach(e=>cb.call(ctx,e)) } }; add(o:any){ this.children.entries.push(o); return this } }

class Physics { _overlap = jest.fn(); add = { existing: (obj:any)=>{ obj.body = { enable:true, velocity: { x: 0, y: 0 }, setCircle: jest.fn(), setVelocity: jest.fn(function(x?:number,y?:number){ if (typeof x==='number') this.velocity.x = x; if (typeof y==='number') this.velocity.y = y; return this }), setVelocityX: jest.fn(function(x:number){ this.velocity.x = x; return this }), setVelocityY: jest.fn(function(y:number){ this.velocity.y = y; return this }), setAllowRotation: jest.fn(), setDrag: jest.fn(), setMaxVelocity: jest.fn(), setSize: jest.fn() } }, overlap: this._overlap } }
class KeyboardKey { handlers: Record<string, Function> = {}; on(ev:string,fn:Function){ this.handlers[ev]=fn; return this } }
class Keyboard { createCursorKeys(){ return {} as any } addKey(){ return new KeyboardKey() } }
class Time { now = 0; addEvent(cfg:any){ (this as any)._lastEvent = cfg; return cfg } delayedCall(){ return {} } }
class Tweens { add(cfg?: any){ if (cfg && typeof cfg.onComplete === 'function') { cfg.onComplete(); } return {} } }
class Load { image(){ return this } on(){ return this } }
class Textures { exists(){ return true } }
class Events { 
  once = jest.fn(); on = jest.fn(); emit = jest.fn(); off = jest.fn(); removeListener = jest.fn()
  constructor() { this.once.mockReturnThis(); this.on.mockReturnThis(); this.emit.mockReturnThis(); this.off.mockReturnThis(); this.removeListener.mockReturnThis() }
}

export class SceneBase { sys:any; scale:any; add:any; tweens:any; textures:any; physics:any; input:any; time:any; scene:any; game:any; load:any; events:any
  constructor(config:any){ this.sys={settings:config}; this.scale={width:1200, height:900}; this.add={ container:(x:number,y:number)=>new Container(x,y), image:()=>new Image(), rectangle:()=>new GameObject(), circle:()=>new GameObject(), polygon:()=>new GameObject(), text:(x:number,y:number,t:string,s?:any)=>new Text(x,y,t,s), graphics:()=>new Graphics(), sprite:(x:number,y:number,_key?:string)=>{ const img=new Image(); img.x=x; img.y=y; return img }, particles:()=>new GameObject(), group:()=>new Group() }; this.tweens=new Tweens(); this.textures=new Textures(); this.physics=new Physics(); this.input={ keyboard: new Keyboard(), on: jest.fn() }; this.time=new Time(); this.scene={ setActive: jest.fn(), start: jest.fn(), isActive: jest.fn(() => true), isVisible: jest.fn(() => true), key: 'test-scene' }; this.game={ loop:{ delta:16 } }; this.load=new Load(); this.events=new Events(); }
}

class Game {
  config: any
  destroyed = false
  constructor(config: any) { this.config = config }
  destroy(removeCanvas?: boolean) { this.destroyed = true; return removeCanvas }
}

export class AUTO {}
export const Scale = { FIT: 'FIT', CENTER_BOTH: 'CENTER_BOTH' }

const PhaserMock = { Game, Scene: SceneBase as any, GameObjects: { Text }, Math: MathNS, Display, Input, BlendModes, Types: { Physics: { Arcade: {} } }, AUTO, Scale }
export default PhaserMock
