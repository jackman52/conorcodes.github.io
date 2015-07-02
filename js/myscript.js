window.onload = function() {
var size = 512;
var SVGstr;

//trying to figure out pasting svgs, not working
/*
$(window).on("paste", function (e) {
    $.each(e.originalEvent.clipboardData.items, function () {
        this.getAsString(function (str) {
            SVGstr = str;
            alert(SVGstr);
            var SVGShape = new Shape();
            SVGShape.importSVG(SVGstr);
        });
    });
});
*/


///THIS IS PAPER JS STUFF////
paper.install(window);
// Get a reference to the canvas object
var canvas = document.getElementById('myCanvas');
// Create an empty project and a view for the canvas:
canvas.width = size;
canvas.height = size;
paper.setup(canvas);

var values = {
    paths: 2,
    minPoints: 5,
    maxPoints: 15,
    minRadius: 30,
    maxRadius: 90
};

var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 2
};

//createPaths();
var theSVG = document.getElementById('shell')
var mySVG = project.importSVG(theSVG);
mySVG.fitBounds(view.bounds);
for(var i = 0; i<mySVG.children.length;i++){
    mySVG.children[i].onDoubleClick = function(event){
        $('input[type=file]').click()
    };
}


function createPaths() {
    var radiusDelta = values.maxRadius - values.minRadius;
    var pointsDelta = values.maxPoints - values.minPoints;
    for (var i = 0; i < values.paths; i++) {
        var radius = values.minRadius + Math.random() * radiusDelta;
        var points = values.minPoints + Math.floor(Math.random() * pointsDelta);
        var center = {};
        center.x = view.size.width * Point.random().x;
        center.y = view.size.height * Point.random().y;
        var path = createBlob(center, radius, points);
        var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
        var hue = Math.random() * 360;
        path.fillColor = {
            hue: 200,
            saturation: 1,
            lightness: 0.5
        };
        path.strokeColor = 'black';
    }
}



function createBlob(center, maxRadius, points) {

    var path = new Path.Circle(center, Math.random() * maxRadius);

    return path;
}

var segment, path;
var movePath = false;





var tool = new Tool();



tool.onMouseDown = function (event) {
    segment = path = null;
    var hitResult = project.hitTest(event.point, hitOptions);
    if (!hitResult) return;

    if (event.modifiers.shift) {
        if (hitResult.type == 'segment') {
            hitResult.segment.remove();
        }
        return;
    }

    if (hitResult) {
        path = hitResult.item;
        if (hitResult.type == 'segment') {
            segment = hitResult.segment;
        } else if (hitResult.type == 'stroke') {
            var location = hitResult.location;
            segment = path.insert(location.index + 1, event.point);
            path.smooth();
        }
    }
    movePath = hitResult.type == 'fill';
    if (movePath) project.activeLayer.addChild(hitResult.item);
};

tool.onMouseMove = function onMouseMove(event) {
    project.activeLayer.selected = false;
    if (event.item) event.item.selected = true;
};

tool.onMouseDrag = function onMouseDrag(event) {
    if (segment) {
        segment.point.x += event.delta.x;
        segment.point.y += event.delta.y;

        path.smooth();
    } else if (path) {
        path.position.x += event.delta.x;
        path.position.y += event.delta.y;



    }
};


///THIS IS THREE JS STUFF////


var materials = [];
var textures = [];
var width = window.innerWidth;
var height = window.innerHeight / 2;



var camera, scene, renderer, geometry, material, mesh;

init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 500;
    scene.add(camera);
    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
//scene.add( light );
var directionalLight = new THREE.DirectionalLight( 0xffeedd );
				directionalLight.position.set( 0, 0, 1 );
				scene.add( directionalLight );

    geometry = new THREE.BoxGeometry(size, size, size);
    var texture = new THREE.Texture(canvas);
    textures.push(texture);

    var thematerial = new THREE.MeshLambertMaterial({
        map: texture
    });
    materials.push(material);



    mesh = new THREE.Mesh(geometry, thematerial);
    //scene.add(mesh);
    
    // model
    var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) {
				};
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

            console.log( item, loaded, total );
    };
    
    var textureagain = new THREE.Texture();
    textureagain.image = canvas;
    textureagain.needsUpdate = true;

var loader = new THREE.OBJLoader();

loader.load( 'obj/last.obj', function ( object ) {

    var material = new THREE.MeshBasicMaterial( { map: texture, transparency:false, opacity:1.0, color:0xFF0000} );

    object.traverse( function ( child ) {

        if ( child instanceof THREE.Mesh ) {

            child.material = thematerial;
            console.log('assigned the material');

        }

    } );

    scene.add(object);
    console.log('happening');

    console.log('added mesh');
    var bBox = new THREE.Box3().setFromObject(object);
    console.log('bbox is: ' + bBox);
    var height = bBox.size().y;
        console.log('height is: ' + height);

    var dist = height / (2 * Math.tan(50 * Math.PI / 360));
            console.log('dist is: ' + dist);

    var pos = object.position;
    console.log('pos is:' + pos);
    camera.position.set(pos.x, pos.y, dist * 4); // fudge factor so you can see the boundaries
    camera.lookAt(pos);

} );


    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

}

var controls	= new THREE.OrbitControls(camera)

function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {
    for (var i = 0; i < textures.length; i++) {
        textures[i].needsUpdate = true;
    }

    renderer.render(scene, camera);

}

////FILE READER STUFF

if ( window.FileReader ) {
 
    document.getElementById("collection").onchange = function doIt(){
     
        var counter = -1, file;
        
        while ( file = this.files[ ++counter ] ) {
         
            var reader = new FileReader();
 
            reader.onloadend = (function(file){
                
                return function(){

                    var image = new Image();
    
                    image.height = 100;
                    image.title = file.name;
                    image.id = "donthide";
                    image.src = /^image/.test(file.type) 
                        ? this.result 
                        : "http://i.stack.imgur.com/t9QlH.png";
    
                    document.body.appendChild( image );
                    
                }
                    
            })(file);
                
            reader.readAsDataURL( file );
            
        }
        
    }
    
}
};