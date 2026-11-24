# Architecture
- Keep appearance preferences in a dedicated browser-persisted theme provider and semantic CSS tokens, separate from financial data, so appearance changes never affect calculations.
- Open grouped settings through existing avatars in an overlay; preserve underlying SAXXI layout geometry unless the user opts into larger text.
- Keep browser settings in a dedicated provider, isolated from financial history; native notification delivery and system-settings deep links must never be simulated.
- Account deletion runs only in an authenticated server function scoped to the caller, requiring recent sign-in, exact confirmation and MFA assurance when enrolled.- Signed-in users' finance state syncs as one JSON row per user in user_finances (RLS own-row); guests stay localStorage-only — keeps reducer logic unchanged.
