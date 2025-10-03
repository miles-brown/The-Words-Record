# Organization Role Format Examples

The AI will now collect organization affiliations in the format: **"Organization Name (Role)"**

## Example for Jeremy Corbyn:

**Affiliated Organizations:** Labour Party (Elected Politician), UK Parliament (Member of Parliament), Campaign for Nuclear Disarmament (Activist), Stop the War Coalition (Activist), Momentum (Supporter)

## Common Roles by Organization Type:

### Political Parties
- **Labour Party (Elected Politician)** - For elected MPs
- **Conservative Party (Member)** - For general members
- **Labour Party (Former Leader)** - For past leadership
- **Democratic Party (Senator)** - For US senators
- **Republican Party (Representative)** - For US representatives

### Parliament/Congress
- **UK Parliament (Member of Parliament)** - For UK MPs
- **UK Parliament (Former MP)** - For former MPs
- **US Congress (Senator)** - For senators
- **US Congress (Representative)** - For representatives
- **UK Government (Minister)** - For government ministers
- **UK Government (Former Prime Minister)** - For former PMs

### Advocacy/Campaign Groups
- **Campaign for Nuclear Disarmament (Activist)** - For active campaigners
- **Amnesty International (Supporter)** - For supporters
- **Palestine Solidarity Campaign (Activist)** - For activists
- **Greenpeace (Board Member)** - For board positions
- **Stop the War Coalition (Founder)** - For founders

### Media Organizations
- **BBC (Presenter)** - For TV/radio presenters
- **Daily Telegraph (Columnist)** - For columnists
- **The Guardian (Journalist)** - For journalists
- **Fox News (News Anchor)** - For anchors
- **CNN (Contributor)** - For contributors

### International Organizations
- **United Nations (Ambassador)** - For ambassadors
- **European Parliament (MEP)** - For MEPs
- **NATO (Representative)** - For representatives

### Political Movements
- **Momentum (Supporter)** - For supporters
- **Tea Party (Member)** - For members
- **Black Lives Matter (Activist)** - For activists

## How the System Parses:

Input: `"Labour Party (Elected Politician), UK Parliament (Member of Parliament)"`

Parsed as:
1. Organization: "Labour Party", Role: "Elected Politician"
2. Organization: "UK Parliament", Role: "Member of Parliament"

The role will be displayed on their profile page showing their relationship to each organization.
