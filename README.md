# Documentazione del progetto SELFIE

## Autori e Contributi

- Elia Babini (0001080431) : Pomodoro(backend e frontend), Landing Page (backend e frontend), TimeMachine (backend e frontend)
- Flavio Zhuka (0001078395) : Calendario(backend e frontend), Autenticazione (backend e frontend), Sistema Notifiche Push, Sistema Scheduler, Sistema di Import/Export Calendario,
- Lorenzo Morlino (0001089839) : Note (backend e frontend), Deployment del sito, Home Page (backend e frontend), Sistema Notifiche Email

## Elenco delle tecnologie usate nel progetto

Lo WebStack utilizzato : Next.js 15 + React 19 + TypeScript
Mentre queste sono le principali dipendenze usate:

- Zod per validazione degli errori
- Bootstrap 5 + CSS-custom per il lato grafico (CSS-custom usato solo per piccole personalizzazioni)
- Per il calendario è stato usato FullCalendar, assieme allo standard RRule per la ricorrenza
- Il duo "ical-generator" + "ical.js" è stato usato per la logica di import/export del calendario
- Autenticazione implementata tramite "bcrypt" + "JWT" firmati con jose, via cookie HttpOnly
- "Web-Push" + Service Worker per integrare le notifiche push
- Nodemailer per mandare email
- Marked per la scrittura di note in markdown

## Uso di AI

Durante il corso del progetto l'uso dell'AI (nel nostro caso GitHub Copilot) è stato complessivamente legato all'autocompletamento di codice già precendetemente scritto (in situazioni simili).
Le rare istanze in cui ci è stato necessario utilizzare un Agent o domandare direttamente lo strumento è stato in occasioni dove vi era necessità di debuggare codice più velocemente, in modo da velocizzare il workflow durante il development del sito.
Nella fasi iniziali è stato inoltre utilizzato per conoscere meglio le potenzialità del framework in modo da poter consultare efficacemente la documentazione, per metabolizzare meglio gli scogli iniziali dell'apprendimento del framework

## Scelte implementative

Per la maggior parte del progetto, è stata seguito un preciso metodo (concordato tra i membri) a livello di sviluppo :
{ logica backend → form per validazione errori → creazione di elementi UI → abbellimento grafico }
Questa metodologia ha accompagnato la maggior parte dello sviluppo ed è stata fondamentale a velocizzarlo, per quanto riguarda il tempo di development, e minimizzare il tempo passato a debuggare (standardizzando il come una funzionalità doveva essere integrata all'interno del progetto)

Di seguito tratteremo alcune delle scelte implementative più significative :

- Schemi Zod centralizzati: validazione e uniformazione dei messaggi d'errore dei form
- Scheduler : processo a parte che effettua compiti periodici (es: notificazione) e controlli ogni secondo
- Server Actions per CRUD e logica dominio: meno API REST dedicate nel Pomodoro e Calendario, sperimentazione con gli strumenti forniti dal framework
- API delle Note : scelto di sviluppare API REST, con endpoint essenziali alle funzionalità richieste
- Time machine: basata su offset virtuale e applicata sull'intera logica del sito
- Ricorrenze: impiegato lo standard RRule, eventi ricorrenti espansi solo per fare controlli dallo scheduler (salvando memoria nel DB)
- Per motivi legati alla semplicità, le limitazioni per la creazione di password e account sono state tolte in modo da permettere la creazione di account (es: fv1) indicati dalle specifiche
- Import/Export Calendario: attraverso parser da noi implementati che traducono gli eventi FullCalendar nello standard iCal
- Notifiche push ed Email: notifiche push mandate tramite ServiceWorker, mentre email gestite
- Autenticazione : fatta a mano attraverso le librerie prima menzionate
- Modularizzazione UI : si è cercato il più possibile (quando fattibile) di modularizzare e dividere in componenti riutilizzabili le componenti front-end
- PomoEventi : sessioni di studio programmate, con ore di studio "addebitate" attraverso lo scheduler

##
