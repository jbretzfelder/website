CLINICAL TRAINING â€” DEPLOYABLE MULTI-FILE VERSION
==================================================

Upload the CONTENTS of this folder into your GitHub repository's training folder.

Files:
  index.html
  styles.css
  training.js
  views/
    home.html
    bigpicture.html
    loc.html
    asam.html
    itp.html
    note.html
    conclusion.html
    cooccurring.html
    mi.html
    group.html
    ethics.html
    family.html
    culture.html
    updated-assessments.html

What changed:
- Existing view HTML was preserved as separate module files.
- Existing shared CSS remains styles.css.
- Existing shared JavaScript remains training.js, with a targeted Updated Assessments module added.
- index.html is now a lightweight loader that fetches all view fragments first, then starts training.js.
- Existing localStorage keys and behavior remain unchanged.
- Updated Assessments uses its own key: doctrain-updated-assessments-progress.

Important:
- Do not upload the ZIP itself as the website. Upload the unzipped files/folders.
- Because index.html uses fetch() to load the view fragments, opening index.html directly by double-clicking
  from Windows may be blocked by browser file:// security. It is intended to run from the website (HTTP/HTTPS).