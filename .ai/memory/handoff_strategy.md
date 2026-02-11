# OMMEO Handoff Strategy

## Overview

The bot is designed to handle ~80% of inquiries autonomously. Handoff to human agents should only occur when specific criteria are met (high complexity, explicit request, or sentiment issues).

## Handoff Triggers

### 1. Explicit Request

- **User says:** "asesor", "humano", "persona", "hablar con alguien".
- **Action:** Immediate handoff.

### 2. Service-Specific Policies

- **Uñas (Nails):** pricing inquiries, portfolio requests, design questions.
  - Reason: Nail pricing is highly variable and visual.
- **Custom Quotes:** Large spaces, commercial cleaning, complex pet grooming needs.

### 3. Confusion Loop (Sentinel)

- **Criteria:** User repeats similar message 3 times without bot understanding (low intent confidence).
- **Action:** Pre-emptive handoff to avoid frustration.

### 4. Negative Sentiment

- **Criteria:** Detected anger, frustration, or complaints.
- **Action:** Handoff to "Soporte" or "Calidad".

## Handoff Flows per Service

- **Limpieza:** Bot handles pricing, details, and booking. Handoff only for complex queries or complaints.
- **Uñas:** Bot handles menu display. Handoff for ALL pricing/design details.
- **Mascotas:** Bot handles standard menu. Handoff for specific breed/size pricing if not in list.
- **Barbería:** Bot handles pricing and booking. Handoff if location coverage is unclear.
