# UPI Shield — Transaction Intelligence (Full Platform)

> **Don't trust the screenshot. Verify the evidence.**

UPI Shield is a multi-layer UPI payment screenshot analysis platform designed to help small merchants, shopkeepers, online sellers, and businesses identify potentially manipulated or suspicious UPI payment screenshots.

---

## The 5 Verification Layers

1. **Layer 1: OCR Intelligence (`Tesseract.js` + Heuristic Parsing)**
   - Extracts Transaction Amount, Beneficiary UPI ID (VPA), UTR / Reference ID, Date & Time, Payment Status, and token confidence.
2. **Layer 2: Metadata Examination (`ExifReader`)**
   - Inspects EXIF, IPTC, and XMP headers.
   - Detects image manipulation tools (Photoshop, Canva, PicsArt, Snapseed, GIMP, etc.).
   - Emphasizes that missing metadata alone is not treated as evidence of manipulation.
3. **Layer 3: Image Integrity Analysis (HTML5 Canvas ELA Forensics)**
   - Computes real-time Error Level Analysis (ELA) on HTML5 Canvas.
   - Identifies localized compression discrepancies, text splices, and uniform color patches.
   - Provides an interactive toggle to switch between the original image and the amplified forensic ELA heat-map.
4. **Layer 4: Transaction Consistency & UPI Specifications**
   - Validates UTR format against NPCI 12-digit numeric standards and app-specific identifiers.
   - Checks currency notations and Indian numbering formatting.
   - Validates authorized UPI PSP handles (`@okaxis`, `@paytm`, `@ybl`, etc.).
   - Validates payment confirmation keywords.
5. **Layer 5: Explainable Risk Assessment Engine**
   - Computes an explainable Suspicion Score (0–100) using a multi-factor formula.
   - Classifies risk into **Low Suspicion (0–29)**, **Medium Suspicion (30–59)**, and **High Suspicion (60–100)**.
   - Generates an itemized evidence breakdown table detailing layer origin, signal severity, explanation, and point impact.
   - Provides concrete next-step verification actions for merchants.
   - Prominently displays the final operational recommendation: *"Do not release goods based solely on a payment screenshot. Confirm that funds have been credited to your account."*

---

## Technical Stack

- **Runtime & Tooling:** Node.js, Vite
- **UI & Routing:** React.js (JavaScript), React Router DOM v6
- **Forensics & Analysis:** HTML5 Canvas ELA, `tesseract.js`, `exifreader`
- **Design System:** Institutional Fintech (Stripe/Razorpay/Wise inspired)
- **State & Storage:** React Context API + LocalStorage persistence

---

## Exact Color Palette

- **Deep Navy / Sidebar:** `#102A43`
- **Secondary Navy:** `#183B56`
- **Main Background:** `#F5F7FA`
- **Card Background:** `#FFFFFF`
- **Primary Accent:** `#147D64`
- **Primary Text:** `#172B3A`
- **Secondary Text:** `#627D98`
- **Border:** `#D9E2EC`
- **High Risk:** `#C0393B`
- **Medium Risk:** `#D69E2E`
- **Low Risk:** `#27835B`

---

## Quick Testing Options

On the **New Scan** page, you can:
1. **Drag-and-drop or browse** any PNG or JPEG payment screenshot (<= 10 MB).
2. **Click "Sample: Authentic GPay"** to test a verified clean transaction with 0% risk.
3. **Click "Sample: Spliced Receipt"** to test a digitally altered screenshot with spliced amounts, non-standard UTR, and high ELA variance.

---

## How to Run

Start the development server:

```powershell
npm run dev
```

Open your browser at:
```
http://localhost:5173
```

To build for production:

```powershell
npm run build
npm run preview
```
