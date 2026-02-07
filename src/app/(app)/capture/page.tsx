'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import ErrorBox from '@/components/ui/error-box';
import { Spinner } from '@/components/ui/spinner';
import { Camera, Upload, X, Check, ChevronDown } from 'lucide-react';
import { capitalize, MEAL_ORDER, STATUS_LABELS } from '@/lib/utils';
import { uploadFoodImage, analyzeImage, createFoodItem, createLogEntry, getCurrentUser } from '@/services/client';
import type { AnalysisResult, MealType, LogStatus } from '@/lib/types';

type Step = 'capture' | 'preview' | 'analyzing' | 'results' | 'saving';

export default function CapturePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<Step>('capture');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Log options
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [status, setStatus] = useState<LogStatus>('consumed');
  const [quantity, setQuantity] = useState(1);

  // --- Camera ---
  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      });
      setStream(s);
      setUseCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch {
      setError('Camera access denied. Try uploading instead.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setUseCamera(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      stopCamera();
      setStep('preview');
    }, 'image/jpeg', 0.9);
  }, [stopCamera]);

  // --- File upload ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep('preview');
  };

  // --- Analyze ---
  const handleAnalyze = async () => {
    if (!imageFile) return;
    setStep('analyzing');
    setError('');

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Upload to Supabase storage
      const { publicUrl } = await uploadFoodImage(user.id, imageFile);

      // Analyze
      const result = await analyzeImage(publicUrl);
      setAnalysis(result);
      setStep('results');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStep('preview');
    }
  };

  // --- Save ---
  const handleSave = async () => {
    if (!analysis || !imageFile) return;
    setSaving(true);
    setError('');

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Create food item
      const foodItem = await createFoodItem({
        user_id: user.id,
        name: analysis.name,
        brand: analysis.brand || null,
        image_url: imagePreview || null,
        thumbnail_url: imagePreview || null,
        serving_size: analysis.serving_size || null,
        calories: analysis.calories,
        protein_g: analysis.protein_g,
        carbs_g: analysis.carbs_g,
        fat_g: analysis.fat_g,
        fiber_g: analysis.fiber_g,
        sugar_g: analysis.sugar_g,
        sodium_mg: analysis.sodium_mg,
        ingredients: analysis.ingredients || null,
        allergens: analysis.allergens || null,
        health_notes: analysis.health_notes || null,
        confidence: analysis.confidence,
      });

      // Create log entry
      await createLogEntry({
        user_id: user.id,
        food_item_id: foodItem.id,
        status,
        meal_type: mealType,
        quantity,
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setSaving(false);
    }
  };

  // --- Reset ---
  const reset = () => {
    stopCamera();
    setImageFile(null);
    setImagePreview(null);
    setAnalysis(null);
    setError('');
    setStep('capture');
  };

  return (
    <>
      <Header title="Add Food">
        {step !== 'capture' && (
          <button onClick={reset} className="text-xs text-[var(--color-muted)] hover:underline">
            Start over
          </button>
        )}
      </Header>

      <main className="mx-auto max-w-lg space-y-5 px-4 py-5 animate-fade-in">
        {error && <ErrorBox message={error} onRetry={step === 'preview' ? handleAnalyze : undefined} />}

        {/* ======== STEP: CAPTURE ======== */}
        {step === 'capture' && (
          <div className="space-y-4">
            {useCamera ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-md bg-black"
                />
                <div className="mt-3 flex justify-center gap-3">
                  <Button onClick={capturePhoto}>
                    <Camera size={16} className="mr-1.5" /> Capture
                  </Button>
                  <Button variant="secondary" onClick={stopCamera}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={startCamera}
                  className="flex w-full flex-col items-center gap-3 rounded-md border-2 border-dashed py-12 text-sm transition-colors hover:bg-[var(--color-hover)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <Camera size={32} className="text-[var(--color-muted)]" />
                  <span className="font-medium">Take a photo</span>
                  <span className="text-xs text-[var(--color-muted)]">Use your camera to snap a food item</span>
                </button>

                <div className="flex items-center gap-3">
                  <hr className="divider flex-1" />
                  <span className="text-xs text-[var(--color-muted)]">or</span>
                  <hr className="divider flex-1" />
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-md border py-3 text-sm font-medium transition-colors hover:bg-[var(--color-hover)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <Upload size={16} />
                  Upload from gallery
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>
        )}

        {/* ======== STEP: PREVIEW ======== */}
        {step === 'preview' && imagePreview && (
          <div className="space-y-4">
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full rounded-md" />
              <button
                onClick={reset}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5"
              >
                <X size={16} />
              </button>
            </div>
            <Button onClick={handleAnalyze} className="w-full" size="lg">
              Analyze this food
            </Button>
          </div>
        )}

        {/* ======== STEP: ANALYZING ======== */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center gap-4 py-16">
            <Spinner size={32} />
            <p className="text-sm text-[var(--color-muted)]">Analyzing your food…</p>
          </div>
        )}

        {/* ======== STEP: RESULTS (editable) ======== */}
        {step === 'results' && analysis && (
          <div className="space-y-5">
            {imagePreview && (
              <img src={imagePreview} alt={analysis.name} className="h-48 w-full rounded-md object-cover" />
            )}

            {/* Confidence badge */}
            <div className="flex items-center gap-2">
              <span className="rounded bg-[var(--color-surface)] px-2 py-0.5 text-[10px] font-medium">
                Confidence: {Math.round(analysis.confidence * 100)}%
              </span>
            </div>

            {/* Editable fields */}
            <Card className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Name</label>
                <input
                  value={analysis.name}
                  onChange={(e) => setAnalysis({ ...analysis, name: e.target.value })}
                  className="w-full rounded border px-3 py-1.5 text-sm"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Serving size</label>
                <input
                  value={analysis.serving_size}
                  onChange={(e) => setAnalysis({ ...analysis, serving_size: e.target.value })}
                  className="w-full rounded border px-3 py-1.5 text-sm"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
            </Card>

            {/* Macro grid */}
            <Card>
              <h3 className="mb-3 text-xs font-semibold">Nutrition</h3>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['calories', 'Calories', 'kcal'],
                  ['protein_g', 'Protein', 'g'],
                  ['carbs_g', 'Carbs', 'g'],
                  ['fat_g', 'Fat', 'g'],
                  ['fiber_g', 'Fiber', 'g'],
                  ['sugar_g', 'Sugar', 'g'],
                  ['sodium_mg', 'Sodium', 'mg'],
                ] as const).map(([key, label, unit]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] text-[var(--color-muted)]">{label} ({unit})</label>
                    <input
                      type="number"
                      step="0.1"
                      value={analysis[key]}
                      onChange={(e) =>
                        setAnalysis({ ...analysis, [key]: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded border px-2 py-1 text-sm tabular-nums"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Health notes */}
            {analysis.health_notes && (
              <Card className="space-y-1">
                <h3 className="text-xs font-semibold">Health Notes</h3>
                <textarea
                  value={analysis.health_notes}
                  onChange={(e) => setAnalysis({ ...analysis, health_notes: e.target.value })}
                  rows={2}
                  className="w-full resize-none rounded border px-2 py-1 text-xs"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </Card>
            )}

            <hr className="divider" />

            {/* Log options */}
            <Card className="space-y-4">
              <h3 className="text-xs font-semibold">Log as</h3>

              <div className="grid grid-cols-3 gap-2">
                {(['consumed', 'about_to_consume', 'about_to_purchase'] as LogStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`rounded border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                      status === s
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-[var(--color-muted)]">Meal</label>
                  <div className="relative">
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value as MealType)}
                      className="w-full appearance-none rounded border bg-white px-3 py-1.5 pr-8 text-sm"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      {MEAL_ORDER.map((m) => (
                        <option key={m} value={m}>{capitalize(m)}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                  </div>
                </div>
                <div className="w-20 space-y-1">
                  <label className="text-[10px] text-[var(--color-muted)]">Qty</label>
                  <input
                    type="number"
                    min={0.25}
                    step={0.25}
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                    className="w-full rounded border px-2 py-1.5 text-sm tabular-nums"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>
              </div>
            </Card>

            <Button onClick={handleSave} loading={saving} className="w-full" size="lg">
              <Check size={16} className="mr-1.5" />
              Save to log
            </Button>
          </div>
        )}

        {/* Hidden canvas for camera capture */}
        <canvas ref={canvasRef} className="hidden" />
      </main>
    </>
  );
}
