declare module '@/vendor/ar-js/ar-threex.mjs' {
  import type * as THREE from 'three'

  export class ArToolkitSource {
    constructor(parameters: { sourceType: 'webcam' })
    domElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
    ready: boolean
    init(onReady: () => void, onError?: (error: unknown) => void): void
    onResizeElement(): void
    copyElementSizeTo(element: HTMLElement): void
  }

  export class ArToolkitContext {
    constructor(parameters: {
      cameraParametersUrl: string
      detectionMode: 'mono'
    })

    arController: unknown
    init(onCompleted: () => void): void
    getProjectionMatrix(): THREE.Matrix4
    update(sourceElement: Element): void
  }

  export class ArMarkerControls {
    constructor(
      context: ArToolkitContext,
      object3d: THREE.Object3D,
      parameters: {
        patternUrl?: string
        preset?: 'hiro'
        type: 'pattern'
      },
    )
  }
}
