# 🧭 Database & Content Rules Guide v1

### **(Governance for Statements, Cases, Topics, Events, and Related Entities)**

---

## **Section A – Statement → Case Graduation Rules**

### **1. Qualification Criteria**

A primary **Statement** qualifies to open a new **Case** when it generates *public reaction or consequence* beyond ordinary commentary.

A combination of more than two the following criteria must generally be met:

- **Public Reaction:** The Statement sparks debate, condemnation, or support.
- **Response:** The original statement is responded to or referenced publicly by two or more notable people.
- **Media Coverage:** The Statement is covered in at least three recognised news or media outlets.
- **Repercussion:** A tangible outcome follows — loss of employment, legal action, disciplinary action, or public backlash.
- **Editorial Judgement:** The content is manually promoted by an editor when it is clearly newsworthy or has broad cultural resonance.

**Cases** are not based on *positive or negative* sentiment nor on volume alone but on **impact and visibility**.

A minimum of **one primary Statement** and at least **two response Statements** are required before the **Case** opens.

---

### **2. Statement-to-Case Conversion**

When a Statement is promoted:

- The **original Statement remains** in the *Statements* database.
- A **new Case record** is created in the *Cases* database.
- The Case record **links back** to the **originating Statement** as its root source.
- All **response Statements**, related Statements remain under the Statement database but are **referenced** by the Case.

No Statement should be deleted or removed from the main pool.

Cases act as an *umbrella structure* connecting all related Statements and responses around a single controversy or event.

---

### **3. Case Lifecycle**

- **Downgrading:** A case cannot be downgraded unless it was misclassified.
- **Archiving:** Cases can be archived once their relevance diminishes, but all cases will remain visible in the UI, they will always be visible in the list of Cases but with less prominence. The person pages of people who made any related statements will have a link to the case page, and cases will be searchable in the site search. Archived cases must not be **featured** stories on the homepage of the site nor **featured** cases.
- **Merging:** Overlapping Cases concerning the the same controversy must be carefully decided on, whether it would merit having more than one similar case open, or keeping the content of cases slightly more fuller, with the timeline on every case page being added to instead as one canonical Case entry, preserving all linked Statements and metadata.

Each Case includes a **status field**: Active, Resolved, Dormant, or Archived.

---

## **Section B – Statements Database (Core Layer)**

The *Statements* database is the primary data repository of the site.

It contains all text-based utterances — comments, posts, quotes, letters, transcripts, interviews, editorials, and any form of published or spoken material.

### **1. Structure**

- Every entry is a **Statement** made by a **Person** (or **Organization**).
- Statements must be dated and include original statement platform type.
- Full text of what the person said must be provided.
- **Responses** are also stored as **Statements**, referencing the original via responseToID.
- **Topics** and **Sources** are linked for context and citation.

### **2. Sourcing & Citation**

- Every **Statement** must include **at least one Source** using Harvard referencing style.
- Multiple sources are encouraged where available for verification.
- Unsourced Statements may be stored as **drafts** but are not to be publicly displayed until sourcing is completed.

### **3. Relationships**

- Each **Statement** must be attributed to at least one **Person** or **Organization**.
- **Statements** may also be attributed to an **Organization** (e.g. if statement type is *official statement*, *social media post* or *press release*).
- **Affiliations** (Person ↔ Organization) appear on both Person and Organization pages to ensure bidirectional visibility.

---

## **Section C – Cases Database (formerly Incidents)**

### **1. Structure**

The former *Incidents* database is now **Cases**.

Routes:

- Browse: /cases
- Individual entries: /cases/[slug]

Each **Case** record contains:

- Originating Statement ID
- **Statements** and Responses with full context for each statement that is linked to the case
- Media coverage (list of **sources,** Harvard referencing of URLs, publications)
- **Repercussions** connected to **Cases** database
- **Topics** that are considered to cover the themes or subject matter of the Case
- **People** and **Organizations** who the statements of the case were made by
- Summary text (editorial synopsis)
- Full background and context
- Case status (Active, Resolved, Archived)
- Optional internal notes (non-public editorial commentary)

### **2. Behaviour**

When a Statement graduates to a Case:

- The Statement remains live in *Statements*.
- The Case page summarizes and visualizes all related reactions and links and displays an interactive **statement timeline** in the UI.
- Repercussions appear prominently on the Case page and more discreetly on Organisation and Topic pages.

---

## **Section D – Topics**

### **1. Topics**

Topics are a **major content type** and will eventually have their own detailed pages at /topics/[slug].

Each Topic should include:

- A written overview or definition
- A category name
- Full **timeline** of related Statements and Cases
- List of related People, Organizations, and Countries closely associated
- Subtopic hierarchy (optional)
- Visual data (charts, timelines, media coverage summaries)

Topics are central to cross-linking the site’s ecosystem and will become the most detailed area after Statements.

---

## **Section E – Editorial Workflow & UI Rules**

### **1. Linking and Relationships**

- Linking between Statements, Cases, Topics, and Organizations can be **manual** (curated by editors) or **assisted** by automatic suggestions (e.g. keyword or entity match).
- Automatic links must be reviewed before publication.

### **2. Visibility and Moderation**

- Hidden or inaccurate Statements are soft-deleted via a hidden flag, with visibility Locked.
- Cases and Statements have visibility states: Draft, Public, Pending Verification, Archived and Locked. Archived statements are still searchable, and linked to any cases, people or organizations but are not featured prominently. Locked statements are totally hidden from the website with any links to their page being redirected to the 404 page.

### **3. Public Interface**

- /cases browse page allows filtering by **date**, **repercussion type**, **topic**, **country**, and **media coverage**.
- Person and Organisation pages display both related Statements and Cases in chronological order.
- Each Case page should include:
    - Root Statement
    - Timeline of reactions
    - Media coverage list
    - Repercussion summary
    - Related Topics and People
    - Sources (Harvard citation list)

### **4. Provenance & History**

All significant modifications — such as promotions, merges, or reclassifications — must be logged with:

- Timestamp
- User/editor ID
- Reason for change
    
    Each Case should have a “History” tab or internal audit record showing its full lifecycle.
    

---

## **Section F – Future Integrations**

### **1. Automation**

In future, an automated alert system should detect when a Statement might qualify for Case promotion using metrics such as:

- Mentions in multiple media sources
- High engagement across social platforms
- Keyword signals of controversy or impact

### **2. Validation & Maintenance**

Invalid or broken relational links (e.g., deleted Person IDs) should trigger a review prompt.

A regular integrity check should ensure that each Statement’s linked People, Organizations, and Sources still exist.

### **3. Archiving Policy**

Depending on the severity rating, inactive or historical Cases may be archived after **4 years of inactivity**, with their pages still visible but not listed as prominently, metadata retained for research and citation.

Archived Cases remain searchable but labelled as *Historical Record*.

---

✅ **Summary**

- *Statements* are the atomic unit: every quote, comment, or reaction.
- *Cases* are curated clusters formed when a Statement becomes newsworthy or impactful.
- *Topics* group related ideas, events, or phenomena.
- *Repercussions* surface consequences, shown prominently on Case pages and selectively elsewhere.
- *Affiliations* are bidirectional and visible on both ends (Person ↔ Organisation).