"use client"
import { ShaderGradient, ShaderGradientCanvas } from 'shadergradient'
import * as reactSpring from '@react-spring/three'
import * as drei from '@react-three/drei'
import * as fiber from '@react-three/fiber'

function ShaderBackground() {
  return (
    <div className='fixed top-0 left-0 w-full h-full -z-50 pointer-events-none'>
        <ShaderGradientCanvas
            style={{
                position: 'absolute',
                top: 0,
                pointerEvents: 'none',
            }}
        >
            <ShaderGradient
                animate="on"
                axesHelper="off"
                bgColor1="#000000"
                bgColor2="#000000"
                brightness={1}
                cAzimuthAngle={180}
                cDistance={2.8}
                cPolarAngle={80}
                cameraZoom={9.1}
                color1="#606080"
                color2="#8d7dca"
                color3="#212121"
                destination="onCanvas"
                embedMode="off"
                envPreset="city"
                format="gif"
                fov={45}
                frameRate={10}
                gizmoHelper="hide"
                grain="on"
                lightType="3d"
                pixelDensity={1}
                positionX={0}
                positionY={0}
                positionZ={0}
                range="disabled"
                rangeEnd={40}
                rangeStart={0}
                reflection={0.1}
                rotationX={50}
                rotationY={0}
                rotationZ={-60}
                shader="defaults"
                type="waterPlane"
                uAmplitude={0}
                uDensity={1.5}
                uFrequency={0}
                uSpeed={0.3}
                uStrength={1.5}
                uTime={8}
                wireframe={false}
            />
        </ShaderGradientCanvas>
    </div>
  )
}

export default ShaderBackground
