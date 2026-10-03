import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { RetailerId, ScanResult } from "@shared/types";
import { api } from "@/api/client";
import { useTopBar } from "@/components/layout";
import { play } from "@/lib/sfx";
import { captureFrame, prepareImageFile } from "./captureFrame";
import { FailurePanel, type FailureAction } from "./FailurePanel";
import { ReadingOverlay } from "./ReadingOverlay";
import { SampleSheet, type SampleId } from "./SampleSheet";
import { ScanConfirmSheet } from "./ScanConfirmSheet";
import { StoreHint } from "./StoreHint";
import { useCamera } from "./useCamera";
import { Viewfinder } from "./Viewfinder";
import { useGuideRect } from "./parts/useGuideRect";
import { useNearestStore } from "./parts/useNearestStore";

type Phase = "viewfinder" | "reading" | "confirm" | "failed";
type Request = { blob: Blob | null; sampleId?: SampleId };

const NO_PRICE = "Penny couldn't find a price in that photo. Try a closer shot of the tag, or type it in.";
const READ_ERROR = "Couldn't read that photo right now.";
const CAMERA_DENIED = "RealDeal needs the camera to read price tags. Allow camera access in your browser settings, or pick a photo instead.";
const CAMERA_MISSING = "Your camera isn't available here. Pick a photo instead, or try a sample tag.";

export function ScanPage() {
  useTopBar({ hidden: true });
  const navigate = useNavigate();
  const location = useLocation();
  const camera = useCamera();
  const { videoRef, state: cameraState } = camera;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const guide = useGuideRect(containerRef);

  const [phase, setPhase] = useState<Phase>("viewfinder");
  const [photo, setPhoto] = useState<{ url: string; owned: boolean } | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [failure, setFailure] = useState<"no_price" | "error">("error");
  const [flash, setFlash] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(false);
  const [chosen, setChosen] = useState<RetailerId | undefined>();
  const lastRequest = useRef<Request | null>(null);
  const requestId = useRef(0);
  const photoRef = useRef(photo);
  photoRef.current = photo;

  const nearest = useNearestStore();
  const fallbackRetailerId = chosen ?? nearest.suggested?.retailerId;

  // Start the camera once on mount; the hook stops it on unmount.
  const startRef = useRef(camera.start);
  startRef.current = camera.start;
  useEffect(() => {
    void startRef.current();
  }, []);

  // Revoke object URLs when they are replaced or the page goes away.
  const showPhoto = useCallback((next: { url: string; owned: boolean } | null) => {
    const prev = photoRef.current;
    if (prev?.owned && prev.url !== next?.url) URL.revokeObjectURL(prev.url);
    setPhoto(next);
  }, []);
  useEffect(() => {
    return () => {
      requestId.current += 1;
      const prev = photoRef.current;
      if (prev?.owned) URL.revokeObjectURL(prev.url);
    };
  }, []);

  const send = useCallback((req: Request) => {
    lastRequest.current = req;
    const id = ++requestId.current;
    setResult(null);
    setPhase("reading");
    api.scanImage(req.blob, req.sampleId).then(
      (res) => {
        if (id !== requestId.current) return;
        setResult(res);
        if (res.status === "ok") {
          setPhase("confirm");
        } else {
          setFailure(res.status === "no_price" ? "no_price" : "error");
          setPhase("failed");
        }
      },
      () => {
        if (id !== requestId.current) return;
        setFailure("error");
        setPhase("failed");
      },
    );
  }, []);

  const backToViewfinder = useCallback(() => {
    requestId.current += 1;
    setPhase("viewfinder");
    setResult(null);
    showPhoto(null);
  }, [showPhoto]);

  const close = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/check");
  };

  const onShutter = async () => {
    const video = videoRef.current;
    if (!video || !guide || cameraState !== "live") return;
    setFlash(true);
    window.setTimeout(() => setFlash(false), 80);
    play("pop");
    try {
      const blob = await captureFrame(video, guide);
      showPhoto({ url: URL.createObjectURL(blob), owned: true });
      send({ blob });
    } catch {
      showPhoto(null);
      setFailure("error");
      lastRequest.current = null;
      setPhase("failed");
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const blob = await prepareImageFile(file);
      showPhoto({ url: URL.createObjectURL(blob), owned: true });
      send({ blob });
    } catch {
      showPhoto(null);
      setFailure("error");
      lastRequest.current = null;
      setPhase("failed");
    }
  };

  const onPickSample = (id: SampleId, src: string) => {
    setSamplesOpen(false);
    showPhoto({ url: src, owned: false });
    send({ blob: null, sampleId: id });
  };

  const typeItIn = () => {
    const candidate = result?.candidates[0];
    const store = result?.retailerId ?? fallbackRetailerId;
    if (candidate) navigate(`/check/${candidate.id}${store ? `?store=${store}` : ""}`);
    else navigate("/check?focus=search");
  };

  const retake = () => backToViewfinder();
  const pickPhoto = () => fileRef.current?.click();
  const trySample = () => setSamplesOpen(true);

  let cameraFailure: { message: string; mood: "sad" | "meh"; actions: FailureAction[] } | null = null;
  if (phase === "viewfinder") {
    if (cameraState === "denied") {
      cameraFailure = {
        message: CAMERA_DENIED,
        mood: "sad",
        actions: [{ label: "Pick a photo", onClick: pickPhoto }, { label: "Type it in", onClick: () => navigate("/check?focus=search") }],
      };
    } else if (cameraState === "unavailable" || cameraState === "insecure") {
      cameraFailure = {
        message: CAMERA_MISSING,
        mood: "meh",
        actions: [{ label: "Pick a photo", onClick: pickPhoto }, { label: "Try a sample tag", onClick: trySample }],
      };
    }
  }

  const failedActions: FailureAction[] =
    failure === "no_price"
      ? [{ label: "Retake", onClick: retake }, { label: "Type it in", onClick: typeItIn }]
      : [
          ...(lastRequest.current ? [{ label: "Try again", onClick: () => lastRequest.current && send(lastRequest.current) }] : [{ label: "Retake", onClick: retake }]),
          { label: "Type it in", onClick: typeItIn },
        ];

  return (
    <div ref={containerRef} className="relative h-full overflow-hidden bg-ink text-white">
      <div className="absolute inset-0" inert={phase !== "viewfinder"}>
        <Viewfinder
          videoRef={videoRef}
          cameraState={cameraState}
          guide={guide}
          torchSupported={camera.torchSupported}
          torchOn={camera.torchOn}
          onToggleTorch={() => void camera.toggleTorch()}
          onClose={close}
          onShutter={() => void onShutter()}
          onPickPhoto={pickPhoto}
          onTypeIt={() => navigate("/check?focus=search")}
          onTrySample={trySample}
          hint={
            <StoreHint
              suggested={nearest.suggested}
              chosen={chosen}
              locating={nearest.locating}
              usingGps={nearest.usingGps}
              onChoose={setChosen}
              onUseLocation={nearest.requestLocation}
            />
          }
        />
      </div>

      {cameraFailure && <FailurePanel mood={cameraFailure.mood} message={cameraFailure.message} actions={cameraFailure.actions} />}

      {phase !== "viewfinder" && photo && (
        <ReadingOverlay photoUrl={photo.url} guide={guide} scanning={phase === "reading"} onCancel={backToViewfinder} />
      )}

      {phase === "failed" && (
        <FailurePanel
          dim
          mood={failure === "no_price" ? "meh" : "sad"}
          message={failure === "no_price" ? NO_PRICE : READ_ERROR}
          actions={failedActions}
        />
      )}

      {flash && <div aria-hidden className="pointer-events-none absolute inset-0 z-40 bg-white" />}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void onFile(file);
        }}
      />

      {result && result.status === "ok" && (
        <ScanConfirmSheet open={phase === "confirm"} result={result} fallbackRetailerId={fallbackRetailerId} onRetake={retake} onClose={backToViewfinder} />
      )}
      <SampleSheet open={samplesOpen} onClose={() => setSamplesOpen(false)} onPick={onPickSample} />
    </div>
  );
}
