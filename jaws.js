/*
 *
 * JAWS - a HTML5 canvas javascript 2D Game Framework
 *
 * Homepage:    http://ippa.se/jaws
 * Works with:  Chrome 4.0, Firefox 3.6+, 4+, IE 9+
 *
 * Formating guide:
 *
 *   jaws.oneFunction()
 *   jaws.one_variable = 1
 *   new jaws.OneConstructor
 *
 * Jaws exposes itself through the global "jaws". It should play nice with all other JS libs.
 * Jaws is using HTML5s <canvas> for all it's graphical operations, so the newer browser the better.
 * Older browsers doesn't support <canvas>. Or if they do, they don't accelerate it with hardware.
 *
 * Have fun! 
 * ippa.
 *
 */

(function(global, undefined) {

  var pressed_keys = {}
  var keycode_to_string = []
  var on_keydown_callbacks = []
  var on_keyup_callbacks = []
  var gameloop = 0
  var assets = new _Asset()

/* 
 * Expose these properties via the global "jaws".
 * As a gamedeveloper this is what you got to work with:
 *
 */
var jaws = {
  Gameloop: Gameloop,
  Sprite: Sprite,
  SpriteSheet: SpriteSheet,
  Animation: Animation,
  assets: assets,
  Rect: Rect,
  Viewport: Viewport,
  log: log,
  pressed: pressed,
  on_keydown: on_keydown,
  on_keyup: on_keyup,
  gameloop: gameloop,
  init: init
}

/*
 *
 * Map all javascript keycodes to easy-to-remember letters/words
 *
 */
function setupInput() {
  var k = []
  
  k[8] = "backspace"
  k[9] = "tab"
  k[13] = "enter"
  k[16] = "shift"
  k[17] = "ctrl"
  k[18] = "alt"
  k[19] = "pause"
  k[20] = "capslock"
  k[27] = "esc"
  k[32] = "space"
  k[33] = "pageup"
  k[34] = "pagedown"
  k[35] = "end"
  k[36] = "home"
  k[37] = "left"
  k[38] = "up"
  k[39] = "right"
  k[40] = "down" 
  k[45] = "insert"
  k[46] = "delete"
  
  k[91] = "leftwindowkey"
  k[92] = "rightwindowkey"
  k[93] = "selectkey"
  k[106] = "multiply"
  k[107] = "add"
  k[109] = "subtract"
  k[110] = "decimalpoint"
  k[111] = "divide"
  
  k[144] = "numlock"
  k[145] = "scrollock"
  k[186] = "semicolon"
  k[187] = "equalsign"
  k[188] = "comma"
  k[189] = "dash"
  k[190] = "period"
  k[191] = "forwardslash"
  k[192] = "graveaccent"
  k[219] = "openbracket"
  k[220] = "backslash"
  k[221] = "closebracket"
  k[222] = "singlequote"

  var numpadkeys = ["numpad1","numpad2","numpad3","numpad4","numpad5","numpad6","numpad7","numpad8","numpad9"]
  var fkeys = ["f1","f2","f3","f4","f5","f6","f7","f8","f9"]
  var numbers = ["1","2","3","4","5","6","7","8","9"]
  var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
  for(var i = 0; numbers[i]; i++)     { k[48+i] = numbers[i] }
  for(var i = 0; letters[i]; i++)     { k[65+i] = letters[i] }
  for(var i = 0; numpadkeys[i]; i++)  { k[96+i] = numpadkeys[i] }
  for(var i = 0; fkeys[i]; i++)       { k[112+i] = fkeys[i] }
  
  this.keycode_to_string = k

  window.onkeydown = function(e) { handleKeyDown(e) }
  window.onkeyup = function(e) { handleKeyUp(e) }
  window.onkeypress = function(e) {};
}

/*
 * handle event "onkeydown" by remembering what key was pressed
 */
function handleKeyUp(e) {
  event = (e) ? e : window.event
  var human_name = this.keycode_to_string[event.keyCode]
  pressed_keys[human_name] = false
  if(on_keyup_callbacks[human_name]) { on_keyup_callbacks[human_name]() }
}

/*
 * handle event "onkeydown" by remembering what key was un-pressed
 */
function handleKeyDown(e) {
  event = (e) ? e : window.event  
  var human_name = this.keycode_to_string[event.keyCode]
  pressed_keys[human_name] = true
  if(on_keydown_callbacks[human_name]) { on_keydown_callbacks[human_name]() }
  // console.log(event.type + " - " + event.keyCode + " " + keycode_to_string[event.keyCode]);
  // e.preventDefault();
}

/*
 * helper to check if a given key currently is pressed. returns true or false.
 */
function pressed(string) {
  return pressed_keys[string]
}

function on_keydown(key, callback) {
  if(key.length) {
    for(var i=0; key[i]; i++) {
      on_keydown_callbacks[key[i]] = callback
    }
  }
  else {
    on_keydown_callbacks[key] = callback
  }
}

function on_keyup(key, callback) {
  if(key.length) {
    for(var i=0; key[i]; i++) {
      on_keyup_callbacks[key[i]] = callback
    }
  }
  else {
    on_keyup_callbacks[key] = callback
  }
}



/*
 *
 */
function log(msg, add) {
  log_div = document.getElementById("log")
  if(log_div) {
    msg += "<br />"
    if(add) { log_div.innerHTML = log_div.innerHTML.toString() + msg } 
    else { log_div.innerHTML = msg }
  } else {
    alert(msg)
  }
}

/*
 * init()
 *
 * Quick and easy startup of a jaws gameloop. Can also be done manually with new jaws.Gameloop etc.
 *
 * */
function init() {
  var setupCallback = arguments[0] || setup
  var updateCallback = arguments[1] || update
  var wanted_fps = arguments[2] || 60

  jaws.gameloop = new jaws.Gameloop(setupCallback, updateCallback, wanted_fps)
  jaws.gameloop.start()
}

/*
 *
 * Gameloop
 *
 * function paint() {
 *    ... your stuff executed every 30 FPS ...
 * }
 *
 * gameloop = jaws.Gameloop(paint, 30)
 * gameloop.start();
 *
 * gameloop.start() starts a 2-step process, where first all assets are loaded. 
 * Then the real gameloop is started with the userspecified FPS.
 *
 * If using the shorter jaws.init() a Gameloop will automatically be created and started for you.
 *
 */
function Gameloop(setup, callback, wanted_fps) {
  this.callback = callback
  this.setup = setup
  var that = this
  
  this.ticks = 0
  this.tick_duration = 0
  this.fps = 0
  
  this.assetsLoaded = function() {
    this.current_tick = (new Date()).getTime();
    this.last_tick = (new Date()).getTime(); 
    this.setup();

    /*
     * TODO, if gameloop is very slow this wont work
     */
    this.update_id = setInterval(this.loop, 1000 / wanted_fps);
  }

  this.start = function() {
    setupInput()
    assets.loadAll({loading: this.assetsLoading, loaded: this.assetsLoaded})
  }
  
  this.assetsLoading = function(src, percent_done) {
    log( percent_done + "%: " + src, true)
    if(percent_done > 60) { that.assetsLoaded() } /* HACK FOR NOW ...*/
  }

  this.loop = function() {
    that.current_tick = (new Date()).getTime();
    that.tick_duration = that.current_tick - that.last_tick
    that.fps = parseInt(1000 / that.tick_duration)

    that.callback()

    that.last_tick = that.current_tick;
    that.ticks++
  }

  this.stop = function() {
    if(this.update_id) { clearInterval(update_id); }
  }
}


/*
 *
 * A bread and butter Rect() - useful for basic collision detection
 *
 */
function Rect(x,y,width,height) {
  this.x = x
  this.y = y
  this.width = width
  this.height = height
  
  this.right = function()   { this.x + this.width }
  this.bottom = function()  { this.y + this.height }

  /* Returns an array of x/y points, the 4 corners of the Rect */
  this.corners = function() {
    return [[this.x, this.y], [this.x, this.width], [this.bottom, this.y], [this.bottom, this.right]]
  }
  
  /* 
   *
   * Returns true if point at x, y lies within calling rect
   *
   * */
  this.collidePoint = function(x, y) {
    return (x >= this.x && x <= this.right && y >= this.y && y <= this.bottom)
  }

  /*
   *
   * Returns true if calling rect overlaps with given rect in any way
   *
  */
  this.collideRect = function(rect) {
    return ((this.x >= rect.x && this.x <= rect.right) || (rect.x >= this.x && rect.x <= this.right ) &&
      (this.y >= rect.y && this.y <= rect.bottom) || (rect.y >= this.y && rect.t <= this.bottom ))
  }
}


/* 
 * _Asset
 *
 * Provides a one-stop access point to all assets (images, sound, video)
 *
 * exposed as jaws.assets
 * 
 *
 * */
function _Asset() {
  this.list = []
  this.data = []
  that = this

  this.fileType = {}
  this.fileType["wav"] = "audio"
  this.fileType["mp3"] = "audio"
  this.fileType["ogg"] = "audio"
  this.fileType["png"] = "image"
  this.fileType["jpg"] = "image"
  this.fileType["jpeg"] = "image"
  this.fileType["bmp"] = "image"

  this.add = function(src) {
    this.list.push({"src": src})
  } 
  this.get = function(src) {
    return this.data[src]
  }
  
  this.getType = function(src) {
    postfix_regexp = /\.([a-zA-Z]+)/;
    postfix = postfix_regexp.exec(src)[1]
    return this.fileType[postfix]
  }
  
  this.loadAll = function(options) {
    this.loadedCount = 0

    /* With these 2 callbacks you can display progress and act when all assets are loaded */
    if(options) {
      this.loaded_callback = options.loaded
      this.loading_callback = options.loading
    }

    for(i=0; this.list[i]; i++) {
      var asset = this.list[i]

      switch(this.getType(asset.src)) {
        case "image":
          asset.image = new Image()
          asset.image.asset = asset
          asset.image.onload = this.imageLoaded
          asset.image.src = asset.src + "?" + parseInt(Math.random()*10000000)
          break;
        case "audio":
          /*
          asset.audio = document.createElement('audio');
          asset.audio.setAttribute('src', asset.src + "?" + parseInt(Math.random()*10000000));
          */
          asset.audio = new Audio(asset.src + "?" + parseInt(Math.random()*10000000))
          asset.audio.asset = asset
          asset.audio.load()
          jaws.log("loading audio...")

          this.data[asset.src] = asset.audio

          //asset.audio.addEventListener("load", function() { alert("fitt") }, true)
          //asset.audio.canplay = this.audioLoaded
          //asset.audio.src = asset.src + "?" + parseInt(Math.random()*10000000)
          break;
      }
    }
  }

  this.imageLoaded = function(e) {
    var asset = this.asset
    that.data[asset.src] = asset.image
    
    that.loadedCount++
    var percent = parseInt(that.loadedCount / that.list.length * 100)
    if(that.loading_callback) { that.loading_callback(asset.src, percent) }
  }
  
  this.audioLoaded = function(e) {
    jaws.log("audio loaded!")
    var asset = this.asset
    that.data[asset.src] = asset.audio
    
    that.loadedCount++
    var percent = parseInt(that.loadedCount / that.list.length * 100)
    if(that.loading_callback) { that.loading_callback(asset.src, percent) }
  }
}

function Sprite(options) {
  this.options = options
  this.x = options.x || 0
  this.y = options.y || 0
  this.canvas = options.canvas
  this.scale = options.scale || 1
  this.visible = options.visible || 1
  this.flipped = options.flipped || 0

  if(options.image) {
    this.image = (options.image.toString() == "[object HTMLImageElement]") ? options.image : assets.data[options.image]
  }
  
  this.__defineGetter__("width", function()   { return (this.image.width) * this.scale } )
  this.__defineGetter__("height", function()  { return (this.image.height) * this.scale } )
  this.__defineGetter__("bottom", function()  { return this.y + this.height-1 } )
  this.__defineGetter__("right", function()   { return this.x + this.width-1 } )
  
  this.draw = function() {
    if(this.visible) { 
      this.canvas.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
  }
}
/*
 *
 * Viewport() is a window (a Rect) into a bigger canvas/image
 *
 * It won't every go "outside" that image.
 * It comes with convenience methods as:
 *
 *   viewport.centerAround(player) which will do just what you think. (player needs to have properties x and y)
 *
 *
 */
function Viewport(options) {
  this.options = options
  this.canvas = canvas
  this.scale = options.scale || 1
  this.visible = options.visible || 1
  this.sprites = options.sprites || []
  this.x = options.x || 0
  this.y = options.y || 0
  this.width = options.width || 0
  this.height = options.height || 0
  
  this.__defineSetter__("x", function(x) {
    this.x = x
    var max_x = this.width - width
    if(this.x < 0) { this.x = 0 }
    if(this.x > max_x) { this.x = max_x }
  })

  this.isInside = function(item) {
    return( item.x >= this.x && item.x <= (this.x + width) && item.y >= this.y && item.y <= (this.y + height) )
  }

  this.centerAround = function(item) {
    this.x = item.x - width / 2
    this.y = item.y - height / 2
  }

  if(options.image) {
    this.image = (options.image.toString() == "[object HTMLImageElement]") ? options.image : assets.data[options.image]
  }

  this.apply = function(func) {
    canvas.translate(-this.x, -this.y)
    func()
  }

 /* 
  this.draw = function() {
    if(this.visible) { 
      this.canvas.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
  }
*/
}

/*
 *
 * Animation() 
 *
 * Manages animation with a given list of frames and durations
 * Takes a object as argument:
 *
 * loop:    true|false  - restart animation when end is reached
 * bounce:  true|false  - rewind the animation frame by frame when end is reached
 * index:   int         - start on this frame
 * frames   array       - array of image/canvas items
 * frame_duration  int   - how long should each frame be displayed
 *
 */

function Animation(options) {
  this.options = options
  this.frames = options.frames
  this.frame_duration = options.frame_duration || 100 // default: 100ms between each frameswitch
  this.index = options.index || 0     // default: start with the very first frame
  this.loop = options.loop || 1
  this.bounce = options.bounce || 0
  this.frame_direction = 1
  
  /* Initializing timer-stuff */ 
  this.current_tick = (new Date()).getTime();
  this.last_tick = (new Date()).getTime();
  this.sum_tick = 0

  this.currentFrame = function() {
    return this.frames[this.index]
  }

  /*
   *
   * Propells the animation forward by counting milliseconds and changing this.index accordingly
   * Supports looping and bouncing animations
   *
   */
  this.update = function() {
    this.current_tick = (new Date()).getTime();
    this.sum_tick += (this.current_tick - this.last_tick);
    this.last_tick = this.current_tick;
 
    if(this.sum_tick > this.frame_duration) {
      this.index += this.frame_direction
      this.sum_tick = 0
    }
    if( (this.index >= this.frames.length) || (this.index <= 0) ) {
      if(this.bounce) {
        this.frame_direction = -this.frame_direction
        this.index += this.frame_direction*2
      }
      else if(this.loop) {
        this.index = 0
      }
    }
    return this
  }

  /*
  this.nameRange = function(name, start, stop) {
    this.named_ranges[name] = [start, stop]
  }
  */

  /*
   *  Like array.slice but returns a new Animation-object with a subset of the frames
   */
  this.slice = function(start, stop) {
    var o = this.options
    o.frames = options.frames.slice().slice(start, stop)
    return new Animation(o)
    
    //var frames = options.frames.slice().(start, stop)
    //return new Animation({frames: frames})
  }
}

/*
 * flipImage() - returns a flipper version of image, usefull for sidescrollers when player changes direction
 */
function flipImage(image) {
  var flipped = document.createElement("canvas")
  flipped.width = image.width
  flipped.height = image.height

  var ctx = flipped.getContext("2d")
  ctx.translate(image.width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(image, 0, 0)

  return flipped
}

function cutImage(image, x, y, width, height) {
  var cut = document.createElement("canvas")
  cut.width = width
  cut.height = height
  
  var ctx = cut.getContext("2d")
  ctx.drawImage(image, x, y, width, height, 0, 0, cut.width, cut.height)
  
  return cut
}

/* Cut up into frame_size pieces and put them in frames[] */
function SpriteSheet(options) {
  this.image = (options.image.toString() == "[object HTMLImageElement]") ? options.image : assets.data[options.image]
  this.orientation = options.orientation || "down"
  this.frame_size = options.frame_size || [32,32]
  this.frames = []

  var index = 0
  for(var x=0; x < this.image.width; x += this.frame_size[0]) {
    for(var y=0; y < this.image.height; y += this.frame_size[1]) {
      this.frames[index++] = cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1])
    }
  }
}

global.jaws = jaws

})(this);

/*
 *
 * Convenience Array prototype methods to make keeping track of game objects fun again
 *
 * Having good game object manage functions helps a lot gamedev.
 * Game objects (your bullets, aliens, enemies, players etc) will need to be
 * updated, draw, deleted. Often in various orders and based on different conditions.
 *
 *   var enemies = []
 *
 *   for(i=0; i < 100; i++) { // create 100 enemies 
 *     enemies.push(new Sprite({image: "enemy.png", x: i, y: 200}))
 *   }
 *   enemies.draw() // calls draw() on all enemies 
 *   enemies.deleteIf(isOutsideCanvas)  // deletes each item in enemies that returns true when isOutsideCanvas(item) is called
 *   enemies.drawIf(isInsideViewport)   // only call draw() on items that returns true when isInsideViewport is called with item as argument 
 *
 */
Array.prototype.draw = function() {
  for(i=0; this[i]; i++) { 
    this[i].draw() 
  }
}

Array.prototype.drawIf = function(condition) {
  for(i=0; this[i]; i++) {
    if( condition(this[i]) ) { this[i].draw() }
  }
}

Array.prototype.update = function() {
  for(i=0; this[i]; i++) {
    this[i].update()
  }
}

Array.prototype.updateIf = function(condition) {
  for(i=0; this[i]; i++) {
    if( condition(this[i]) ) { this[i].update() }
  }
}

Array.prototype.deleteIf = function(condition) {
  for(i=0; this[i]; i++) {
    if( condition(this[i]) ) { this.splice(i,1) }
  }
}
