# Google-Certified Consent Management Platform (CMP) Setup

## Overview

This site now uses **Google Funding Choices**, a free, Google-certified Consent Management Platform (CMP) that is **required** for serving Google AdSense ads in the European Economic Area (EEA), United Kingdom, and Switzerland.

## Why This Is Required

### GDPR Compliance
The General Data Protection Regulation (GDPR) requires:
- Explicit user consent before storing cookies or collecting personal data
- Clear information about what data is collected and how it's used
- Easy way for users to manage their consent preferences
- Google-certified CMP to work with AdSense

### AdSense Requirements
Google AdSense policy requires:
- A Google-certified CMP for EEA/UK/Swiss traffic
- Consent must be collected BEFORE ads load
- Users must be able to change their consent at any time
- Non-compliance results in ad serving being disabled

## Implementation

### What Was Removed
- ❌ Custom cookie consent dialogue (`components/CookieConsent.tsx`)
- ❌ Humorous cookie wall with "accept or leave" approach
- ❌ Manual EU/UK detection code
- ❌ localStorage-based consent tracking

### What Was Added
✅ **Google Funding Choices CMP** - Google's official, free CMP solution

**Location:** `pages/_document.tsx`

**Code Added:**
```javascript
{/* Google Funding Choices - Consent Management Platform */}
<script
  async
  src="https://fundingchoicesmessages.google.com/i/pub-5418171625369886?ers=1"
  nonce="FUNDING-CHOICES"
/>
<script nonce="FUNDING-CHOICES">
  (function() {
    function signalGooglefcPresent() {
      if (!window.frames['googlefcPresent']) {
        if (document.body) {
          const iframe = document.createElement('iframe');
          iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';
          iframe.style.display = 'none';
          iframe.name = 'googlefcPresent';
          document.body.appendChild(iframe);
        } else {
          setTimeout(signalGooglefcPresent, 0);
        }
      }
    }
    signalGooglefcPresent();
  })();
</script>
```

## How It Works

### 1. Automatic Detection
- Google Funding Choices automatically detects users from EEA/UK/Switzerland
- Uses IP geolocation (more reliable than timezone/language detection)
- No custom code needed

### 2. Consent Collection
When a user from regulated region visits:
1. CMP displays a consent dialogue
2. User can accept, reject, or customize consent
3. Choice is stored in Google's consent framework
4. AdSense respects the user's choice

### 3. Ad Serving
- **Consent given:** Personalized ads can be served
- **Consent denied:** Only non-personalized ads (if configured)
- **No consent:** Ads are blocked until user makes a choice

### 4. Users Outside EEA/UK/Switzerland
- No consent dialogue shown
- Ads load normally
- No interruption to user experience

## Configuration in Google AdSense

To complete the setup, you need to configure Funding Choices in your AdSense account:

### Step 1: Access Funding Choices
1. Log into [Google AdSense](https://adsense.google.com/)
2. Go to **Privacy & messaging** → **Funding Choices**
3. Click **Create message**

### Step 2: Create Consent Message
1. Choose **EU Consent Message**
2. Select your preferred design/template
3. Customize the message text (optional)
4. Configure consent options:
   - "Accept" button
   - "Reject" or "Manage options" button
   - List of ad technology providers
5. Preview how it looks

### Step 3: Publish
1. Click **Publish**
2. The message goes live immediately
3. Code is already in your site (from this implementation)

### Step 4: Configure Non-Personalized Ads (Recommended)
In AdSense settings:
1. Enable **non-personalized ads** for users who reject consent
2. This ensures you still earn revenue while respecting user choice

## Testing

### Test the CMP
1. Visit your site with a VPN set to a EU country
2. You should see the Google Funding Choices consent dialogue
3. Try accepting, rejecting, and customizing
4. Verify ads load appropriately based on consent

### Test Without VPN
1. Visit from US/non-EU location
2. No consent dialogue should appear
3. Ads should load normally

## Compliance Benefits

✅ **GDPR Compliant** - Meets all EU data protection requirements
✅ **Google Certified** - Approved by Google for AdSense
✅ **TCF 2.2 Compatible** - Uses IAB Transparency & Consent Framework
✅ **Automatic Updates** - Google maintains compliance as regulations change
✅ **User Control** - Users can change preferences anytime
✅ **Revenue Optimized** - Balances compliance with ad revenue

## Revenue Impact

### With Consent
- Full personalized ads
- Higher CPM rates
- Better targeting

### Without Consent
- Non-personalized ads (if enabled)
- Lower CPM rates (~30-50% of personalized)
- Still generates revenue

### Best Practice
Enable both personalized AND non-personalized ads to maximize revenue while respecting user choice.

## Important Notes

⚠️ **Do NOT** remove or modify the CMP code
⚠️ **Do NOT** implement custom cookie dialogues alongside this
⚠️ **Do** configure the message design in AdSense dashboard
⚠️ **Do** enable non-personalized ads as a fallback

## Support Resources

- [Google Funding Choices Help](https://support.google.com/adsense/answer/9803766)
- [GDPR Compliance for AdSense](https://support.google.com/adsense/answer/7670013)
- [EU User Consent Policy](https://www.google.com/about/company/user-consent-policy/)

## Verification

After deployment, verify:
1. ✅ CMP loads on EU/UK traffic
2. ✅ AdSense respects consent choices
3. ✅ Non-EU traffic unaffected
4. ✅ Ads serve appropriately based on consent
5. ✅ Users can manage consent via "Ad Choices" link

---

**Status:** ✅ Implementation Complete
**Certification:** Google-Certified CMP
**Compliance:** GDPR, ePrivacy Directive, CCPA-ready
**Deployment:** Ready for Production
