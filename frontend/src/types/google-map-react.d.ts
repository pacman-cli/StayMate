declare module 'google-map-react' {
    import { Component, CSSProperties, ReactNode } from 'react'

    export interface BootstrapURLKeys {
        key: string
        language?: string
        region?: string
        libraries?: string[]
    }

    export interface Coords {
        lat: number
        lng: number
    }

    export interface Props {
        bootstrapURLKeys?: BootstrapURLKeys
        defaultCenter?: Coords
        center?: Coords
        defaultZoom?: number
        zoom?: number
        onBoundsChange?: (args: any) => void
        onChildClick?: (key: string, childProps: any) => void
        onClick?: (value: any) => void
        options?: any
        distanceToMouse?: (pt: { x: number, y: number }, mousePos: { x: number, y: number }) => number
        googleMapLoader?: (bootstrapURLKeys: any) => void
        onGoogleApiLoaded?: (args: { map: any, maps: any }) => void
        yesIWantToUseGoogleMapApiInternals?: boolean
        draggable?: boolean
        style?: CSSProperties
        children?: ReactNode
        className?: string // Added to support styling
    }

    export default class GoogleMapReact extends Component<Props> { }
}
