import {
  Vector3,
  Matrix4,
  PerspectiveCamera,
  Quaternion,
} from 'three';

    /**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 * @author halvves / https://github.com/halvves (i only es6 moduled it)
 *
 * WebVR Spec: http://mozvr.github.io/webvr-spec/webvr.html
 *
 * Firefox: http://mozvr.com/downloads/
 * Chromium: https://webvr.info/get-chrome
 *
 */

export default class VREffect {
  constructor(renderer, onError) {
    this.autoSubmitFrame = true;
    this.cameraL = new PerspectiveCamera();
    this.cameraL.layers.enable(1);
    this.cameraR = new PerspectiveCamera();
    this.cameraR.layers.enable(2);
    this.defaultLeftBounds = [0.0, 0.0, 0.5, 1.0];
    this.defaultRightBounds = [0.5, 0.0, 0.5, 1.0];
    this.eyeTranslationL = new Vector3();
    this.eyeTranslationR = new Vector3();
    this.eyeMatrixL = new Matrix4();
    this.eyeMatrixR = new Matrix4();
    this.headMatrix = new Matrix4();
    this.frameData = null;
    this.isPresenting = false;
    this.poseOrientation = new Quaternion();
    this.posePosition = new Vector3();
    this.renderer = renderer;
    this.renderRectL;
    this.renderRectR;
    this.rendererSize = renderer.getSize();
    this.rendererUpdateStyle = false;
    this.rendererPixelRatio = renderer.getPixelRatio();
    this.vrDisplay;
    this.vrDisplays;

    if ('VRFrameData' in window) {
      this.frameData = new VRFrameData();
    }

    if (navigator.getVRDisplays) {
      navigator
        .getVRDisplays()
        .then((displays) => {
          this.vrDisplays = displays;
          if (displays.length > 0) {
            this.vrDisplay = displays[0];
          } else {
            if (onError) onError('VR input not available.');
          }
        })
        .catch(() => {
          console.warn('VRControls: Unable to get VR Displays');
        });
    }

    this.onVRDisplayPresentChange = this.onVRDisplayPresentChange.bind(this);

    window.addEventListener('vrdisplaypresentchange', this.onVRDisplayPresentChange, false);
  }

  getVRDisplay() {
    return this.vrDisplay;
  }

  setVRDisplay(value) {
    this.vrDisplay = value;
  }

  getVRDisplays() {
    console.warn('VREffect: getVRDisplays() is being deprecated.');
    return this.vrDisplays;
  }

  setSize(width, height, updateStyle) {
    const renderer = this.renderer;

    this.rendererSize = {
      width,
      height,
    };
    this.rendererUpdateStyle = updateStyle;

    if (this.isPresenting) {
      const eyeParamsL = this.vrDisplay.getEyeParameters('left');
      renderer.setPixelRatio(1);
      renderer.setSize(eyeParamsL.renderWidth * 2, eyeParamsL.renderHeight, false);
    } else {
      renderer.setPixelRatio(this.rendererPixelRatio);
      renderer.setSize(width, height, updateStyle);
    }
  }

  onVRDisplayPresentChange() {
    const renderer = this.renderer;
    const vrDisplay = this.vrDisplay;
    const wasPresenting = this.isPresenting;

    this.isPresenting = vrDisplay !== undefined && vrDisplay.isPresenting;

    if (this.isPresenting) {
      const eyeParamsL = vrDisplay.getEyeParameters('left');
      const eyeWidth = eyeParamsL.renderWidth;
      const eyeHeight = eyeParamsL.renderHeight;

      if (!wasPresenting) {
        this.rendererPixelRatio = renderer.getPixelRatio();
        this.rendererSize = renderer.getSize();
        renderer.setPixelRatio(1);
        renderer.setSize(eyeWidth * 2, eyeHeight, false);
      }
    } else if (wasPresenting) {
      renderer.setPixelRatio(this.rendererPixelRatio);
      renderer.setSize(this.rendererSize.width, this.rendererSize.height, this.rendererUpdateStyle);
    }
  }

  setFullScreen(boolean) {
    return new Promise((resolve, reject) => {
      if (this.vrDisplay === undefined) {
        reject(new Error('No VR hardware found.'));
        return;
      }
      if (this.isPresenting === boolean) {
        resolve();
        return;
      }
      if (boolean) {
        resolve(this.vrDisplay.requestPresent([{source: this.renderer.domElement}]));
      } else {
        resolve(this.vrDisplay.exitPresent());
      }
    });
  };

  requestPresent() {
    return this.setFullScreen(true);
  };

  exitPresent() {
    return this.setFullScreen(false);
  };

  requestAnimationFrame(f) {
    if (this.vrDisplay !== undefined) {
      return this.vrDisplay.requestAnimationFrame(f);
    } else {
      return window.requestAnimationFrame(f);
    }
  };

  cancelAnimationFrame(h) {
    if (this.vrDisplay !== undefined) {
      this.vrDisplay.cancelAnimationFrame(h);
    } else {
      window.cancelAnimationFrame(h);
    }
  };

  submitFrame() {
    if (this.vrDisplay !== undefined && this.isPresenting) {
      this.vrDisplay.submitFrame();
    }
  };

  render(scene, camera, renderTarget, forceClear) {
    const cameraL = this.cameraL;
    const cameraR = this.cameraR;
    const eyeTranslationL = this.eyeTranslationL;
    const eyeTranslationR = this.eyeTranslationR;
    const frameData = this.frameData;
    const renderer = this.renderer;
    const vrDisplay = this.vrDisplay;

    if (vrDisplay && this.isPresenting) {
      const autoUpdate = scene.autoUpdate;

      if (autoUpdate) {
        scene.updateMatrixWorld();
        scene.autoUpdate = false;
      }

      if (Array.isArray(scene)) {
        console.warn( 'VREffect.render() no longer supports arrays. Use object.layers instead.' );
        scene = scene[0];
      }

      // When rendering we don't care what the recommended size is, only what the actual size
      // of the backbuffer is.
      const size = renderer.getSize();
      const layers = vrDisplay.getLayers();
      let leftBounds;
      let rightBounds;

      if (layers.length) {
        const layer = layers[0];
        leftBounds = layer.leftBounds !== null && layer.leftBounds.length === 4 ? (
          layer.leftBounds
        ) : this.defaultLeftBounds;
        rightBounds = layer.rightBounds !== null && layer.rightBounds.length === 4 ? (
          layer.rightBounds
        ) : this.defaultRightBounds;
      } else {
        leftBounds = this.defaultLeftBounds;
        rightBounds = this.defaultRightBounds;
      }

      const renderRectL = this.renderRectL = {
        x: Math.round(size.width * leftBounds[0]),
        y: Math.round(size.height * leftBounds[1]),
        width: Math.round(size.width * leftBounds[2]),
        height: Math.round(size.height * leftBounds[3]),
      };

      const renderRectR = this.renderRectR = {
        x: Math.round(size.width * rightBounds[0]),
        y: Math.round(size.height * rightBounds[1]),
        width: Math.round(size.width * rightBounds[2]),
        height: Math.round(size.height * rightBounds[3]),
      };

      if (renderTarget) {
        renderer.setRenderTarget(renderTarget);
        renderTarget.scissorTest = true;
      } else {
        renderer.setRenderTarget(null);
        renderer.setScissorTest(true);
      }

      if (renderer.autoClear || forceClear) {
        renderer.clear();
      }

      if (camera.parent === null) {
        camera.updateMatrixWorld();
      }

      camera.matrixWorld.decompose(cameraL.position, cameraL.quaternion, cameraL.scale);

      cameraR.position.copy(cameraL.position);
      cameraR.quaternion.copy(cameraL.quaternion);
      cameraR.scale.copy(cameraL.scale);

      if (vrDisplay.getFrameData) {
        vrDisplay.depthNear = camera.near;
        vrDisplay.depthFar = camera.far;
        vrDisplay.getFrameData(frameData);

        cameraL.projectionMatrix.elements = frameData.leftProjectionMatrix;
        cameraR.projectionMatrix.elements = frameData.rightProjectionMatrix;

        this.getEyeMatrices(frameData);

        cameraL.updateMatrix();
        cameraL.matrix.multiply(this.eyeMatrixL);
        cameraL.matrix.decompose(cameraL.position, cameraL.quaternion, cameraL.scale);

        cameraR.updateMatrix();
        cameraR.matrix.multiply(this.eyeMatrixR);
        cameraR.matrix.decompose(cameraR.position, cameraR.quaternion, cameraR.scale);
      } else {
        const eyeParamsL = vrDisplay.getEyeParameters('left');
        const eyeParamsR = vrDisplay.getEyeParameters('right');

        cameraL.projectionMatrix = this.fovToProjection(eyeParamsL.fieldOfView, true, camera.near, camera.far);
        cameraR.projectionMatrix = this.fovToProjection(eyeParamsR.fieldOfView, true, camera.near, camera.far);

        eyeTranslationL.fromArray(eyeParamsL.offset);
        eyeTranslationR.fromArray(eyeParamsR.offset);

        cameraL.translateOnAxis(eyeTranslationL, cameraL.scale.x);
        cameraR.translateOnAxis(eyeTranslationR, cameraR.scale.x);
      }

      // render left eye
      if (renderTarget) {
        renderTarget.viewport.set(
          renderRectL.x,
          renderRectL.y,
          renderRectL.width,
          renderRectL.height
        );
        renderTarget.scissor.set(
          renderRectL.x,
          renderRectL.y,
          renderRectL.width,
          renderRectL.height
        );
      } else {
        renderer.setViewport(
          renderRectL.x,
          renderRectL.y,
          renderRectL.width,
          renderRectL.height
        );
        renderer.setScissor(
          renderRectL.x,
          renderRectL.y,
          renderRectL.width,
          renderRectL.height
        );
      }
      renderer.render(scene, cameraL, renderTarget, forceClear);

      // render right eye
      if (renderTarget) {
        renderTarget.viewport.set(
          renderRectR.x,
          renderRectR.y,
          renderRectR.width,
          renderRectR.height
        );
        renderTarget.scissor.set(
          renderRectR.x,
          renderRectR.y,
          renderRectR.width,
          renderRectR.height
        );
      } else {
        renderer.setViewport(
          renderRectR.x,
          renderRectR.y,
          renderRectR.width,
          renderRectR.height
        );
        renderer.setScissor(
          renderRectR.x,
          renderRectR.y,
          renderRectR.width,
          renderRectR.height
        );
      }
      renderer.render(scene, cameraR, renderTarget, forceClear);

      if (renderTarget) {
        renderTarget.viewport.set(0, 0, size.width, size.height);
        renderTarget.scissor.set(0, 0, size.width, size.height);
        renderTarget.scissorTest = false;
        renderer.setRenderTarget(null);
      } else {
        renderer.setViewport(0, 0, size.width, size.height);
        renderer.setScissorTest(false);
      }

      if (autoUpdate) {
        scene.autoUpdate = true;
      }

      if (this.autoSubmitFrame) {
        this.submitFrame();
      }
      return;
    }

    // Regular render mode if not HMD
    renderer.render(scene, camera, renderTarget, forceClear);
  };

  dispose() {
    window.removeEventListener('vrdisplaypresentchange', this.onVRDisplayPresentChange, false);
  };

  getEyeMatrices(frameData) {
    const eyeMatrixL = this.eyeMatrixL;
    const eyeMatrixR = this.eyeMatrixR;
    const headMatrix = this.headMatrix;
    const poseOrientation = this.poseOrientation;
    const posePosition = this.posePosition;

    // Compute the matrix for the position of the head based on the pose
    if (frameData.pose.orientation) {
      poseOrientation.fromArray(frameData.pose.orientation);
      headMatrix.makeRotationFromQuaternion(poseOrientation);
    }	else {
      headMatrix.identity();
    }

    if (frameData.pose.position) {
      posePosition.fromArray(frameData.pose.position);
      headMatrix.setPosition(posePosition);
    }

    /* * * *
    * The view matrix transforms vertices from sitting space to eye space.
    * As such, the view matrix can be thought of as a product of two matrices:
    *
    * headToEyeMatrix * sittingToHeadMatrix
    */

    /* * * *
    * The headMatrix that we've calculated above is the model matrix of the
    * head in sitting space, which is the inverse of sittingToHeadMatrix.
    *
    * So when we multiply the view matrix with headMatrix, we're left with
    * headToEyeMatrix:
    *
    * viewMatrix * headMatrix =
    * headToEyeMatrix * sittingToHeadMatrix * headMatrix =
    * headToEyeMatrix
    */
    eyeMatrixL.fromArray(frameData.leftViewMatrix);
    eyeMatrixL.multiply(headMatrix);
    eyeMatrixR.fromArray(frameData.rightViewMatrix);
    eyeMatrixR.multiply(headMatrix);

    // The eye's model matrix in head space is the inverse of headToEyeMatrix
    // we calculated above.
    eyeMatrixL.getInverse(eyeMatrixL);
    eyeMatrixR.getInverse(eyeMatrixR);
  }

  fovToNDCScaleOffset(fov) {
    const pxscale = 2.0 / (fov.leftTan + fov.rightTan);
    const pxoffset = (fov.leftTan - fov.rightTan) * pxscale * 0.5;
    const pyscale = 2.0 / (fov.upTan + fov.downTan);
    const pyoffset = (fov.upTan - fov.downTan) * pyscale * 0.5;

    return {
      scale: [pxscale, pyscale],
      offset: [pxoffset, pyoffset],
    };
  }

  fovPortToProjection(fov, rightHanded, zNear, zFar) {
    rightHanded = rightHanded === undefined ? true : rightHanded;
    zNear = zNear === undefined ? 0.01 : zNear;
    zFar = zFar === undefined ? 10000.0 : zFar;

    const handednessScale = rightHanded ? - 1.0 : 1.0;

    // start with an identity matrix
    const mobj = new Matrix4();
    const m = mobj.elements;

    // and with scale/offset info for normalized device coords
    let scaleAndOffset = this.fovToNDCScaleOffset(fov);

    // X result, map clip edges to [-w,+w]
    m[0 * 4 + 0] = scaleAndOffset.scale[0];
    m[0 * 4 + 1] = 0.0;
    m[0 * 4 + 2] = scaleAndOffset.offset[0] * handednessScale;
    m[0 * 4 + 3] = 0.0;

    // Y result, map clip edges to [-w,+w]
    // Y offset is negated because this proj matrix transforms from world coords with Y=up,
    // but the NDC scaling has Y=down (thanks D3D?)
    m[1 * 4 + 0] = 0.0;
    m[1 * 4 + 1] = scaleAndOffset.scale[1];
    m[1 * 4 + 2] = - scaleAndOffset.offset[1] * handednessScale;
    m[1 * 4 + 3] = 0.0;

    // Z result (up to the app)
    m[2 * 4 + 0] = 0.0;
    m[2 * 4 + 1] = 0.0;
    m[2 * 4 + 2] = zFar / (zNear - zFar) * - handednessScale;
    m[2 * 4 + 3] = (zFar * zNear) / (zNear - zFar);

    // W result (= Z in)
    m[3 * 4 + 0] = 0.0;
    m[3 * 4 + 1] = 0.0;
    m[3 * 4 + 2] = handednessScale;
    m[3 * 4 + 3] = 0.0;

    mobj.transpose();

    return mobj;
  }

  fovToProjection(fov, rightHanded, zNear, zFar) {
    const DEG2RAD = Math.PI / 180.0;
    const fovPort = {
      upTan: Math.tan(fov.upDegrees * DEG2RAD),
      downTan: Math.tan(fov.downDegrees * DEG2RAD),
      leftTan: Math.tan(fov.leftDegrees * DEG2RAD),
      rightTan: Math.tan(fov.rightDegrees * DEG2RAD),
    };

    return this.fovPortToProjection(fovPort, rightHanded, zNear, zFar);
  }
};
