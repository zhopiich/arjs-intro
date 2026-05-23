import type * as THREE from 'three'

export class ArToolkitSource {
  constructor(parameters: {
    sourceType: 'webcam'
    sourceWidth?: number
    sourceHeight?: number
  })
  domElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ready: boolean
  init(onReady: () => void, onError?: (error: unknown) => void): void
  onResizeElement(): void
  copyElementSizeTo(element: HTMLElement): void
  dispose(): void
}

export class ArToolkitContext {
  constructor(parameters: {
    cameraParametersUrl: string
    detectionMode: 'mono' | 'color'
    maxDetectionRate?: number
    canvasWidth?: number
    canvasHeight?: number
    patternRatio?: number
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
      type: 'pattern' | 'barcode'
      patternUrl?: string
      preset?: 'hiro' | 'kanji'
      barcodeValue?: number
      changeMatrixMode?: 'cameraTransformMatrix' | 'modelViewMatrix'
      minConfidence?: number
    },
  )
}

export class ArMarkerHelper {
  constructor(markerControls: ArMarkerControls, size?: number)
}

export class ArToolkitProfile {
  static parameters: Record<string, unknown>
}

declare global {
  interface WindowEventMap {
    markerFound: CustomEvent<ArMarkerControls>
    markerLost: CustomEvent<ArMarkerControls>
  }
}
