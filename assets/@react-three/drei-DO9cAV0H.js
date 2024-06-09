import{a as Qe,r as w}from"../react-dom-D88IX_79.js";import{j as Je,f as b,k as et,l as tt,m as ot,n as nt,o as at,E as it,Q as Ae,P as $,O as Q,p as Se,g as E,q as H,r as U,s as st,t as rt}from"../three-X2-rq5fz.js";import{u as k,a as ct}from"./fiber-Bbiazfew.js";var De={},Re=Qe;De.createRoot=Re.createRoot,De.hydrateRoot=Re.hydrateRoot;function te(){return te=Object.assign?Object.assign.bind():function(h){for(var s=1;s<arguments.length;s++){var c=arguments[s];for(var e in c)({}).hasOwnProperty.call(c,e)&&(h[e]=c[e])}return h},te.apply(null,arguments)}const lt=parseInt(Je.replace(/\D+/g,""));var ut=Object.defineProperty,ft=(h,s,c)=>s in h?ut(h,s,{enumerable:!0,configurable:!0,writable:!0,value:c}):h[s]=c,Ce=(h,s,c)=>(ft(h,typeof s!="symbol"?s+"":s,c),c);const ee={uniforms:{turbidity:{value:2},rayleigh:{value:1},mieCoefficient:{value:.005},mieDirectionalG:{value:.8},sunPosition:{value:new b},up:{value:new b(0,1,0)}},vertexShader:`
      uniform vec3 sunPosition;
      uniform float rayleigh;
      uniform float turbidity;
      uniform float mieCoefficient;
      uniform vec3 up;

      varying vec3 vWorldPosition;
      varying vec3 vSunDirection;
      varying float vSunfade;
      varying vec3 vBetaR;
      varying vec3 vBetaM;
      varying float vSunE;

      // constants for atmospheric scattering
      const float e = 2.71828182845904523536028747135266249775724709369995957;
      const float pi = 3.141592653589793238462643383279502884197169;

      // wavelength of used primaries, according to preetham
      const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
      // this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
      // (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
      const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

      // mie stuff
      // K coefficient for the primaries
      const float v = 4.0;
      const vec3 K = vec3( 0.686, 0.678, 0.666 );
      // MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
      const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

      // earth shadow hack
      // cutoffAngle = pi / 1.95;
      const float cutoffAngle = 1.6110731556870734;
      const float steepness = 1.5;
      const float EE = 1000.0;

      float sunIntensity( float zenithAngleCos ) {
        zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
        return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
      }

      vec3 totalMie( float T ) {
        float c = ( 0.2 * T ) * 10E-18;
        return 0.434 * c * MieConst;
      }

      void main() {

        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vWorldPosition = worldPosition.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        gl_Position.z = gl_Position.w; // set z to camera.far

        vSunDirection = normalize( sunPosition );

        vSunE = sunIntensity( dot( vSunDirection, up ) );

        vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

        float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

      // extinction (absorbtion + out scattering)
      // rayleigh coefficients
        vBetaR = totalRayleigh * rayleighCoefficient;

      // mie coefficients
        vBetaM = totalMie( turbidity ) * mieCoefficient;

      }
    `,fragmentShader:`
      varying vec3 vWorldPosition;
      varying vec3 vSunDirection;
      varying float vSunfade;
      varying vec3 vBetaR;
      varying vec3 vBetaM;
      varying float vSunE;

      uniform float mieDirectionalG;
      uniform vec3 up;

      const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );

      // constants for atmospheric scattering
      const float pi = 3.141592653589793238462643383279502884197169;

      const float n = 1.0003; // refractive index of air
      const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

      // optical length at zenith for molecules
      const float rayleighZenithLength = 8.4E3;
      const float mieZenithLength = 1.25E3;
      // 66 arc seconds -> degrees, and the cosine of that
      const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

      // 3.0 / ( 16.0 * pi )
      const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
      // 1.0 / ( 4.0 * pi )
      const float ONE_OVER_FOURPI = 0.07957747154594767;

      float rayleighPhase( float cosTheta ) {
        return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
      }

      float hgPhase( float cosTheta, float g ) {
        float g2 = pow( g, 2.0 );
        float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
        return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
      }

      void main() {

        vec3 direction = normalize( vWorldPosition - cameraPos );

      // optical length
      // cutoff angle at 90 to avoid singularity in next formula.
        float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
        float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
        float sR = rayleighZenithLength * inverse;
        float sM = mieZenithLength * inverse;

      // combined extinction factor
        vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

      // in scattering
        float cosTheta = dot( direction, vSunDirection );

        float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
        vec3 betaRTheta = vBetaR * rPhase;

        float mPhase = hgPhase( cosTheta, mieDirectionalG );
        vec3 betaMTheta = vBetaM * mPhase;

        vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
        Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

      // nightsky
        float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
        float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
        vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
        vec3 L0 = vec3( 0.1 ) * Fex;

      // composition + solar disc
        float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
        L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

        vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

        vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

        gl_FragColor = vec4( retColor, 1.0 );

      #include <tonemapping_fragment>
      #include <${lt>=154?"colorspace_fragment":"encodings_fragment"}>

      }
    `},_e=new et({name:"SkyShader",fragmentShader:ee.fragmentShader,vertexShader:ee.vertexShader,uniforms:tt.clone(ee.uniforms),side:ot,depthWrite:!1});let ce=class extends nt{constructor(){super(new at(1,1,1),_e)}};Ce(ce,"SkyShader",ee);Ce(ce,"material",_e);var mt=Object.defineProperty,ht=(h,s,c)=>s in h?mt(h,s,{enumerable:!0,configurable:!0,writable:!0,value:c}):h[s]=c,n=(h,s,c)=>(ht(h,typeof s!="symbol"?s+"":s,c),c);const J=new st,je=new rt,pt=Math.cos(70*(Math.PI/180)),Le=(h,s)=>(h%s+s)%s;let dt=class extends it{constructor(s,c){super(),n(this,"object"),n(this,"domElement"),n(this,"enabled",!0),n(this,"target",new b),n(this,"minDistance",0),n(this,"maxDistance",1/0),n(this,"minZoom",0),n(this,"maxZoom",1/0),n(this,"minPolarAngle",0),n(this,"maxPolarAngle",Math.PI),n(this,"minAzimuthAngle",-1/0),n(this,"maxAzimuthAngle",1/0),n(this,"enableDamping",!1),n(this,"dampingFactor",.05),n(this,"enableZoom",!0),n(this,"zoomSpeed",1),n(this,"enableRotate",!0),n(this,"rotateSpeed",1),n(this,"enablePan",!0),n(this,"panSpeed",1),n(this,"screenSpacePanning",!0),n(this,"keyPanSpeed",7),n(this,"zoomToCursor",!1),n(this,"autoRotate",!1),n(this,"autoRotateSpeed",2),n(this,"reverseOrbit",!1),n(this,"reverseHorizontalOrbit",!1),n(this,"reverseVerticalOrbit",!1),n(this,"keys",{LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"}),n(this,"mouseButtons",{LEFT:H.ROTATE,MIDDLE:H.DOLLY,RIGHT:H.PAN}),n(this,"touches",{ONE:U.ROTATE,TWO:U.DOLLY_PAN}),n(this,"target0"),n(this,"position0"),n(this,"zoom0"),n(this,"_domElementKeyEvents",null),n(this,"getPolarAngle"),n(this,"getAzimuthalAngle"),n(this,"setPolarAngle"),n(this,"setAzimuthalAngle"),n(this,"getDistance"),n(this,"listenToKeyEvents"),n(this,"stopListenToKeyEvents"),n(this,"saveState"),n(this,"reset"),n(this,"update"),n(this,"connect"),n(this,"dispose"),this.object=s,this.domElement=c,this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this.getPolarAngle=()=>f.phi,this.getAzimuthalAngle=()=>f.theta,this.setPolarAngle=t=>{let o=Le(t,2*Math.PI),a=f.phi;a<0&&(a+=2*Math.PI),o<0&&(o+=2*Math.PI);let r=Math.abs(o-a);2*Math.PI-r<r&&(o<a?o+=2*Math.PI:a+=2*Math.PI),d.phi=o-a,e.update()},this.setAzimuthalAngle=t=>{let o=Le(t,2*Math.PI),a=f.theta;a<0&&(a+=2*Math.PI),o<0&&(o+=2*Math.PI);let r=Math.abs(o-a);2*Math.PI-r<r&&(o<a?o+=2*Math.PI:a+=2*Math.PI),d.theta=o-a,e.update()},this.getDistance=()=>e.object.position.distanceTo(e.target),this.listenToKeyEvents=t=>{t.addEventListener("keydown",se),this._domElementKeyEvents=t},this.stopListenToKeyEvents=()=>{this._domElementKeyEvents.removeEventListener("keydown",se),this._domElementKeyEvents=null},this.saveState=()=>{e.target0.copy(e.target),e.position0.copy(e.object.position),e.zoom0=e.object.zoom},this.reset=()=>{e.target.copy(e.target0),e.object.position.copy(e.position0),e.object.zoom=e.zoom0,e.object.updateProjectionMatrix(),e.dispatchEvent(O),e.update(),u=i.NONE},this.update=(()=>{const t=new b,o=new b(0,1,0),a=new Ae().setFromUnitVectors(s.up,o),r=a.clone().invert(),g=new b,L=new Ae,z=2*Math.PI;return function(){const xe=e.object.position;a.setFromUnitVectors(s.up,o),r.copy(a).invert(),t.copy(xe).sub(e.target),t.applyQuaternion(a),f.setFromVector3(t),e.autoRotate&&u===i.NONE&&oe(Ie()),e.enableDamping?(f.theta+=d.theta*e.dampingFactor,f.phi+=d.phi*e.dampingFactor):(f.theta+=d.theta,f.phi+=d.phi);let C=e.minAzimuthAngle,_=e.maxAzimuthAngle;isFinite(C)&&isFinite(_)&&(C<-Math.PI?C+=z:C>Math.PI&&(C-=z),_<-Math.PI?_+=z:_>Math.PI&&(_-=z),C<=_?f.theta=Math.max(C,Math.min(_,f.theta)):f.theta=f.theta>(C+_)/2?Math.max(C,f.theta):Math.min(_,f.theta)),f.phi=Math.max(e.minPolarAngle,Math.min(e.maxPolarAngle,f.phi)),f.makeSafe(),e.enableDamping===!0?e.target.addScaledVector(N,e.dampingFactor):e.target.add(N),e.zoomToCursor&&M||e.object.isOrthographicCamera?f.radius=ae(f.radius):f.radius=ae(f.radius*P),t.setFromSpherical(f),t.applyQuaternion(r),xe.copy(e.target).add(t),e.object.matrixAutoUpdate||e.object.updateMatrix(),e.object.lookAt(e.target),e.enableDamping===!0?(d.theta*=1-e.dampingFactor,d.phi*=1-e.dampingFactor,N.multiplyScalar(1-e.dampingFactor)):(d.set(0,0,0),N.set(0,0,0));let K=!1;if(e.zoomToCursor&&M){let X=null;if(e.object instanceof $&&e.object.isPerspectiveCamera){const V=t.length();X=ae(V*P);const q=V-X;e.object.position.addScaledVector(Z,q),e.object.updateMatrixWorld()}else if(e.object.isOrthographicCamera){const V=new b(v.x,v.y,0);V.unproject(e.object),e.object.zoom=Math.max(e.minZoom,Math.min(e.maxZoom,e.object.zoom/P)),e.object.updateProjectionMatrix(),K=!0;const q=new b(v.x,v.y,0);q.unproject(e.object),e.object.position.sub(q).add(V),e.object.updateMatrixWorld(),X=t.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),e.zoomToCursor=!1;X!==null&&(e.screenSpacePanning?e.target.set(0,0,-1).transformDirection(e.object.matrix).multiplyScalar(X).add(e.object.position):(J.origin.copy(e.object.position),J.direction.set(0,0,-1).transformDirection(e.object.matrix),Math.abs(e.object.up.dot(J.direction))<pt?s.lookAt(e.target):(je.setFromNormalAndCoplanarPoint(e.object.up,e.target),J.intersectPlane(je,e.target))))}else e.object instanceof Q&&e.object.isOrthographicCamera&&(K=P!==1,K&&(e.object.zoom=Math.max(e.minZoom,Math.min(e.maxZoom,e.object.zoom/P)),e.object.updateProjectionMatrix()));return P=1,M=!1,K||g.distanceToSquared(e.object.position)>Y||8*(1-L.dot(e.object.quaternion))>Y?(e.dispatchEvent(O),g.copy(e.object.position),L.copy(e.object.quaternion),K=!1,!0):!1}})(),this.connect=t=>{t===document&&console.error('THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.'),e.domElement=t,e.domElement.style.touchAction="none",e.domElement.addEventListener("contextmenu",we),e.domElement.addEventListener("pointerdown",Te),e.domElement.addEventListener("pointercancel",B),e.domElement.addEventListener("wheel",Me)},this.dispose=()=>{var t,o,a,r,g,L;e.domElement&&(e.domElement.style.touchAction="auto"),(t=e.domElement)==null||t.removeEventListener("contextmenu",we),(o=e.domElement)==null||o.removeEventListener("pointerdown",Te),(a=e.domElement)==null||a.removeEventListener("pointercancel",B),(r=e.domElement)==null||r.removeEventListener("wheel",Me),(g=e.domElement)==null||g.ownerDocument.removeEventListener("pointermove",ie),(L=e.domElement)==null||L.ownerDocument.removeEventListener("pointerup",B),e._domElementKeyEvents!==null&&e._domElementKeyEvents.removeEventListener("keydown",se)};const e=this,O={type:"change"},y={type:"start"},I={type:"end"},i={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let u=i.NONE;const Y=1e-6,f=new Se,d=new Se;let P=1;const N=new b,x=new E,A=new E,S=new E,D=new E,R=new E,j=new E,T=new E,p=new E,m=new E,Z=new b,v=new E;let M=!1;const l=[],W={};function Ie(){return 2*Math.PI/60/60*e.autoRotateSpeed}function G(){return Math.pow(.95,e.zoomSpeed)}function oe(t){e.reverseOrbit||e.reverseHorizontalOrbit?d.theta+=t:d.theta-=t}function le(t){e.reverseOrbit||e.reverseVerticalOrbit?d.phi+=t:d.phi-=t}const ue=(()=>{const t=new b;return function(a,r){t.setFromMatrixColumn(r,0),t.multiplyScalar(-a),N.add(t)}})(),fe=(()=>{const t=new b;return function(a,r){e.screenSpacePanning===!0?t.setFromMatrixColumn(r,1):(t.setFromMatrixColumn(r,0),t.crossVectors(e.object.up,t)),t.multiplyScalar(a),N.add(t)}})(),F=(()=>{const t=new b;return function(a,r){const g=e.domElement;if(g&&e.object instanceof $&&e.object.isPerspectiveCamera){const L=e.object.position;t.copy(L).sub(e.target);let z=t.length();z*=Math.tan(e.object.fov/2*Math.PI/180),ue(2*a*z/g.clientHeight,e.object.matrix),fe(2*r*z/g.clientHeight,e.object.matrix)}else g&&e.object instanceof Q&&e.object.isOrthographicCamera?(ue(a*(e.object.right-e.object.left)/e.object.zoom/g.clientWidth,e.object.matrix),fe(r*(e.object.top-e.object.bottom)/e.object.zoom/g.clientHeight,e.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),e.enablePan=!1)}})();function ne(t){e.object instanceof $&&e.object.isPerspectiveCamera||e.object instanceof Q&&e.object.isOrthographicCamera?P/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),e.enableZoom=!1)}function me(t){e.object instanceof $&&e.object.isPerspectiveCamera||e.object instanceof Q&&e.object.isOrthographicCamera?P*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),e.enableZoom=!1)}function he(t){if(!e.zoomToCursor||!e.domElement)return;M=!0;const o=e.domElement.getBoundingClientRect(),a=t.clientX-o.left,r=t.clientY-o.top,g=o.width,L=o.height;v.x=a/g*2-1,v.y=-(r/L)*2+1,Z.set(v.x,v.y,1).unproject(e.object).sub(e.object.position).normalize()}function ae(t){return Math.max(e.minDistance,Math.min(e.maxDistance,t))}function pe(t){x.set(t.clientX,t.clientY)}function Ne(t){he(t),T.set(t.clientX,t.clientY)}function de(t){D.set(t.clientX,t.clientY)}function ze(t){A.set(t.clientX,t.clientY),S.subVectors(A,x).multiplyScalar(e.rotateSpeed);const o=e.domElement;o&&(oe(2*Math.PI*S.x/o.clientHeight),le(2*Math.PI*S.y/o.clientHeight)),x.copy(A),e.update()}function ke(t){p.set(t.clientX,t.clientY),m.subVectors(p,T),m.y>0?ne(G()):m.y<0&&me(G()),T.copy(p),e.update()}function Ye(t){R.set(t.clientX,t.clientY),j.subVectors(R,D).multiplyScalar(e.panSpeed),F(j.x,j.y),D.copy(R),e.update()}function Fe(t){he(t),t.deltaY<0?me(G()):t.deltaY>0&&ne(G()),e.update()}function He(t){let o=!1;switch(t.code){case e.keys.UP:F(0,e.keyPanSpeed),o=!0;break;case e.keys.BOTTOM:F(0,-e.keyPanSpeed),o=!0;break;case e.keys.LEFT:F(e.keyPanSpeed,0),o=!0;break;case e.keys.RIGHT:F(-e.keyPanSpeed,0),o=!0;break}o&&(t.preventDefault(),e.update())}function ge(){if(l.length==1)x.set(l[0].pageX,l[0].pageY);else{const t=.5*(l[0].pageX+l[1].pageX),o=.5*(l[0].pageY+l[1].pageY);x.set(t,o)}}function be(){if(l.length==1)D.set(l[0].pageX,l[0].pageY);else{const t=.5*(l[0].pageX+l[1].pageX),o=.5*(l[0].pageY+l[1].pageY);D.set(t,o)}}function ve(){const t=l[0].pageX-l[1].pageX,o=l[0].pageY-l[1].pageY,a=Math.sqrt(t*t+o*o);T.set(0,a)}function Ue(){e.enableZoom&&ve(),e.enablePan&&be()}function Ze(){e.enableZoom&&ve(),e.enableRotate&&ge()}function Ee(t){if(l.length==1)A.set(t.pageX,t.pageY);else{const a=re(t),r=.5*(t.pageX+a.x),g=.5*(t.pageY+a.y);A.set(r,g)}S.subVectors(A,x).multiplyScalar(e.rotateSpeed);const o=e.domElement;o&&(oe(2*Math.PI*S.x/o.clientHeight),le(2*Math.PI*S.y/o.clientHeight)),x.copy(A)}function ye(t){if(l.length==1)R.set(t.pageX,t.pageY);else{const o=re(t),a=.5*(t.pageX+o.x),r=.5*(t.pageY+o.y);R.set(a,r)}j.subVectors(R,D).multiplyScalar(e.panSpeed),F(j.x,j.y),D.copy(R)}function Pe(t){const o=re(t),a=t.pageX-o.x,r=t.pageY-o.y,g=Math.sqrt(a*a+r*r);p.set(0,g),m.set(0,Math.pow(p.y/T.y,e.zoomSpeed)),ne(m.y),T.copy(p)}function Be(t){e.enableZoom&&Pe(t),e.enablePan&&ye(t)}function Ke(t){e.enableZoom&&Pe(t),e.enableRotate&&Ee(t)}function Te(t){var o,a;e.enabled!==!1&&(l.length===0&&((o=e.domElement)==null||o.ownerDocument.addEventListener("pointermove",ie),(a=e.domElement)==null||a.ownerDocument.addEventListener("pointerup",B)),qe(t),t.pointerType==="touch"?We(t):Xe(t))}function ie(t){e.enabled!==!1&&(t.pointerType==="touch"?Ge(t):Ve(t))}function B(t){var o,a,r;$e(t),l.length===0&&((o=e.domElement)==null||o.releasePointerCapture(t.pointerId),(a=e.domElement)==null||a.ownerDocument.removeEventListener("pointermove",ie),(r=e.domElement)==null||r.ownerDocument.removeEventListener("pointerup",B)),e.dispatchEvent(I),u=i.NONE}function Xe(t){let o;switch(t.button){case 0:o=e.mouseButtons.LEFT;break;case 1:o=e.mouseButtons.MIDDLE;break;case 2:o=e.mouseButtons.RIGHT;break;default:o=-1}switch(o){case H.DOLLY:if(e.enableZoom===!1)return;Ne(t),u=i.DOLLY;break;case H.ROTATE:if(t.ctrlKey||t.metaKey||t.shiftKey){if(e.enablePan===!1)return;de(t),u=i.PAN}else{if(e.enableRotate===!1)return;pe(t),u=i.ROTATE}break;case H.PAN:if(t.ctrlKey||t.metaKey||t.shiftKey){if(e.enableRotate===!1)return;pe(t),u=i.ROTATE}else{if(e.enablePan===!1)return;de(t),u=i.PAN}break;default:u=i.NONE}u!==i.NONE&&e.dispatchEvent(y)}function Ve(t){if(e.enabled!==!1)switch(u){case i.ROTATE:if(e.enableRotate===!1)return;ze(t);break;case i.DOLLY:if(e.enableZoom===!1)return;ke(t);break;case i.PAN:if(e.enablePan===!1)return;Ye(t);break}}function Me(t){e.enabled===!1||e.enableZoom===!1||u!==i.NONE&&u!==i.ROTATE||(t.preventDefault(),e.dispatchEvent(y),Fe(t),e.dispatchEvent(I))}function se(t){e.enabled===!1||e.enablePan===!1||He(t)}function We(t){switch(Oe(t),l.length){case 1:switch(e.touches.ONE){case U.ROTATE:if(e.enableRotate===!1)return;ge(),u=i.TOUCH_ROTATE;break;case U.PAN:if(e.enablePan===!1)return;be(),u=i.TOUCH_PAN;break;default:u=i.NONE}break;case 2:switch(e.touches.TWO){case U.DOLLY_PAN:if(e.enableZoom===!1&&e.enablePan===!1)return;Ue(),u=i.TOUCH_DOLLY_PAN;break;case U.DOLLY_ROTATE:if(e.enableZoom===!1&&e.enableRotate===!1)return;Ze(),u=i.TOUCH_DOLLY_ROTATE;break;default:u=i.NONE}break;default:u=i.NONE}u!==i.NONE&&e.dispatchEvent(y)}function Ge(t){switch(Oe(t),u){case i.TOUCH_ROTATE:if(e.enableRotate===!1)return;Ee(t),e.update();break;case i.TOUCH_PAN:if(e.enablePan===!1)return;ye(t),e.update();break;case i.TOUCH_DOLLY_PAN:if(e.enableZoom===!1&&e.enablePan===!1)return;Be(t),e.update();break;case i.TOUCH_DOLLY_ROTATE:if(e.enableZoom===!1&&e.enableRotate===!1)return;Ke(t),e.update();break;default:u=i.NONE}}function we(t){e.enabled!==!1&&t.preventDefault()}function qe(t){l.push(t)}function $e(t){delete W[t.pointerId];for(let o=0;o<l.length;o++)if(l[o].pointerId==t.pointerId){l.splice(o,1);return}}function Oe(t){let o=W[t.pointerId];o===void 0&&(o=new E,W[t.pointerId]=o),o.set(t.pageX,t.pageY)}function re(t){const o=t.pointerId===l[0].pointerId?l[1]:l[0];return W[o.pointerId]}c!==void 0&&this.connect(c),this.update()}};const Mt=w.forwardRef(({makeDefault:h,camera:s,regress:c,domElement:e,enableDamping:O=!0,keyEvents:y=!1,onChange:I,onStart:i,onEnd:u,...Y},f)=>{const d=k(m=>m.invalidate),P=k(m=>m.camera),N=k(m=>m.gl),x=k(m=>m.events),A=k(m=>m.setEvents),S=k(m=>m.set),D=k(m=>m.get),R=k(m=>m.performance),j=s||P,T=e||x.connected||N.domElement,p=w.useMemo(()=>new dt(j),[j]);return ct(()=>{p.enabled&&p.update()},-1),w.useEffect(()=>(y&&p.connect(y===!0?T:y),p.connect(T),()=>void p.dispose()),[y,T,c,p,d]),w.useEffect(()=>{const m=M=>{d(),c&&R.regress(),I&&I(M)},Z=M=>{i&&i(M)},v=M=>{u&&u(M)};return p.addEventListener("change",m),p.addEventListener("start",Z),p.addEventListener("end",v),()=>{p.removeEventListener("start",Z),p.removeEventListener("end",v),p.removeEventListener("change",m)}},[I,i,u,p,d,A]),w.useEffect(()=>{if(h){const m=D().controls;return S({controls:p}),()=>S({controls:m})}},[h,p]),w.createElement("primitive",te({ref:f,object:p,enableDamping:O},Y))});function gt(h,s,c=new b){const e=Math.PI*(h-.5),O=2*Math.PI*(s-.5);return c.x=Math.cos(O),c.y=Math.sin(e),c.z=Math.sin(O),c}const wt=w.forwardRef(({inclination:h=.6,azimuth:s=.1,distance:c=1e3,mieCoefficient:e=.005,mieDirectionalG:O=.8,rayleigh:y=.5,turbidity:I=10,sunPosition:i=gt(h,s),...u},Y)=>{const f=w.useMemo(()=>new b().setScalar(c),[c]),[d]=w.useState(()=>new ce);return w.createElement("primitive",te({object:d,ref:Y,"material-uniforms-mieCoefficient-value":e,"material-uniforms-mieDirectionalG-value":O,"material-uniforms-rayleigh-value":y,"material-uniforms-sunPosition-value":i,"material-uniforms-turbidity-value":I,scale:f},u))});export{Mt as O,wt as S,De as c};
