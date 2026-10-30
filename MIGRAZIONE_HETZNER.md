# Pizzeria La Rosa — migrazione menu (fase 1)

Questa versione usa `https://api-pizzeria.lariosystems.it/api/menu` per la pagina pubblica `/it` e `/en`.

## Vercel
Impostare la variabile server-side `PIZZERIA_API_URL=https://api-pizzeria.lariosystems.it` in Production e Preview (facoltativa, presente già come default). Effettuare il deploy con il codice di questa cartella.

## Limitazioni
- Area `/admin` ancora collegata a Supabase: non utilizzarla per modificare il menu migrato. Occorre sviluppare backend autenticato e migrare login/operazioni CRUD.
- Foto Supabase attualmente bloccate (HTTP 402): questa versione le nasconde, senza eliminarne i riferimenti dal database.
- Nessuna modifica a PostgreSQL, Caddy, DNS o Centralino AI.
- È una fase di migrazione del menu pubblico, NON un sito completamente migrato.

Prima del deploy, testare `/it` e `/en` in Preview Vercel e verificare prezzi, allergeni e categorie. Effettuare il rollout della Production solo dopo controllo.
