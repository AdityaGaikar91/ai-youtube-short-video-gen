import { AbsoluteFill, Audio, Img, interpolate, Sequence, useCurrentFrame, useVideoConfig, spring } from "remotion";

function RemotionComposition({ videoData }) {
  const captions = videoData?.captionJson;
  const { fps, width, height } = useVideoConfig();
  const imageList = videoData?.images;
  const frame = useCurrentFrame();

  const getDurationFrame = () => {
    if (!captions || captions.length === 0) return 300;
    const totalDuration = captions[captions.length - 1]?.end * fps;
    return totalDuration;
  };

  const currentCaptionData = (() => {
    const currentTime = frame / fps;
    return captions?.find((item) => currentTime >= item.start && currentTime <= item.end);
  })();

  const currentCaption = currentCaptionData ? currentCaptionData.word : "";

  // Spring animation for the "Pop" effect
  const springValue = currentCaptionData 
    ? spring({
        frame: frame - (currentCaptionData.start * fps),
        fps,
        config: { damping: 12, stiffness: 200 },
      })
    : 0;

  const captionStyle = videoData?.caption?.style || "";

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <AbsoluteFill>
        {imageList?.map((item, index) => {
          const totalDuration = getDurationFrame();
          const startTime = (index * totalDuration) / imageList.length;
          const duration = totalDuration / imageList.length;

          // Ken Burns Effect: Random-ish pan and zoom
          const zoom = interpolate(
            frame,
            [startTime, startTime + duration],
            index % 2 === 0 ? [1, 1.2] : [1.2, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const xPan = interpolate(
            frame,
            [startTime, startTime + duration],
            index % 3 === 0 ? [-5, 5] : index % 3 === 1 ? [5, -5] : [0, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <Sequence key={index} from={startTime} durationInFrames={Math.ceil(duration)}>
              <AbsoluteFill>
                <Img
                  src={item}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${zoom}) translateX(${xPan}%)`,
                  }}
                />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* Captions with Pop Animation */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          top: undefined,
          bottom: 120,
          height: 200,
          textAlign: "center",
          width: "100%",
        }}
      >
        <h2 
          className={`text-7xl font-black uppercase tracking-tighter ${captionStyle}`}
          style={{
            color: "white",
            textShadow: "4px 4px 0px rgba(0,0,0,0.8), -2px -2px 0px rgba(0,0,0,0.8), 2px -2px 0px rgba(0,0,0,0.8), -2px 2px 0px rgba(0,0,0,0.8)",
            transform: `scale(${0.8 + (springValue * 0.4)})`,
            filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))",
            padding: "0 40px",
          }}
        >
          {currentCaption}
        </h2>
      </AbsoluteFill>

      {videoData?.audioUrl && <Audio src={videoData.audioUrl} />}
    </AbsoluteFill>
  );
}

export default RemotionComposition;
