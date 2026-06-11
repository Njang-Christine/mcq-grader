# Automated MCQ Grader

A simple web-based MCQ grading tool. Upload an answer key (CSV or JSON) and student submission CSV to grade automatically and export a CSV report.

Files:
- index.html — main UI
- style.css — styles with unique color palette
- app.js — grading logic and CSV parsing
- sample_answer_key.csv — sample key
- sample_submissions.csv — sample submissions

Quick usage:
1. Open `index.html` in a browser.
2. Upload `sample_answer_key.csv` and `sample_submissions.csv` from this folder.
3. Click "Grade Submissions".
4. Download the generated `mcq_report.csv`.

Hosting (GitHub Pages):
- Create a GitHub repo, push this folder, then enable GitHub Pages for the `main` branch or `gh-pages` branch.

Commands:

```bash
git init
git add .
git commit -m "Add automated MCQ grader"
# create remote repo on GitHub, then:
git remote add origin <your-repo-url>
git push -u origin main
```

Alternative quick hosting: drag `index.html` into Netlify Drop (https://app.netlify.com/drop) or use GitHub Pages.

If you want, I can initialize a Git repo here and prepare files for publishing (you'll need to provide the remote URL or push yourself).