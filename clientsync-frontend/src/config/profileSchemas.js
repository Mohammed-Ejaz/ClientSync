// Single source of truth for which fields each freelancer specialty
// collects from their clients. Previously this list was duplicated three
// times (OnboardingWizard, SubmissionDetail's read view, SubmissionDetail's
// edit view) — adding one field meant editing three places by hand and
// they had already drifted slightly. Now every consumer derives its UI
// from `getSteps(profileType)`.

const field = (section, key, label, opts = {}) => ({
    section, // one of companyInfo | projectAssets | technicalDetails
    key,
    label,
    type: 'text', // text | email | url | tel | textarea
    required: false,
    placeholder: '',
    note: '',
    ...opts,
});

const COMPANY_STEP = {
    title: 'Company Information',
    icon: '🏢',
    subtitle: 'Tell us about your business.',
    fields: [
        field('companyInfo', 'address', 'Company Address', {
            required: true,
            placeholder: '123 Main St, City, Country',
        }),
        field('companyInfo', 'contactEmail', 'Billing / Contact Email', {
            type: 'email',
            required: true,
            placeholder: 'billing@yourcompany.com',
        }),
        field('companyInfo', 'phone', 'Phone Number (optional)', {
            type: 'tel',
            placeholder: '+1 555 000 0000',
        }),
        field('companyInfo', 'website', 'Company Website (optional)', {
            type: 'url',
            placeholder: 'https://yourcompany.com',
        }),
    ],
};

const BRAND_ASSETS_STEP = {
    title: 'Brand Assets',
    icon: '🎨',
    subtitle: 'Share your visual identity so we can match it perfectly.',
    fields: [
        field('projectAssets', 'primaryColor', 'Primary Brand Color', {
            kind: 'color',
            placeholder: '#6366F1',
            note: 'Paste your hex color code',
        }),
        field('projectAssets', 'fontFamily', 'Preferred Font Family', {
            placeholder: 'Inter, Roboto, etc.',
        }),
        field('projectAssets', 'logoUrl', 'Logo / Asset URL (optional)', {
            type: 'url',
            placeholder: 'https://…/logo.png',
            note: 'A publicly accessible URL to your logo file',
        }),
    ],
};

const TECHNICAL_SETUP_STEP = {
    title: 'Technical Setup',
    icon: '⚙️',
    subtitle: 'Your current infrastructure and hosting details.',
    fields: [
        field('technicalDetails', 'domainName', 'Domain Name', {
            placeholder: 'www.yourcompany.com',
        }),
        field('technicalDetails', 'hostingProvider', 'Current Hosting Provider', {
            placeholder: 'AWS, Vercel, GoDaddy, etc.',
        }),
        field('technicalDetails', 'cmsPlatform', 'CMS Platform (optional)', {
            placeholder: 'WordPress, Webflow, Shopify, etc.',
        }),
        field('technicalDetails', 'serverRegion', 'Server Region (optional)', {
            placeholder: 'US East, EU West, etc.',
        }),
    ],
};

const STEPS_BY_PROFILE = {
    developer: [
        COMPANY_STEP,
        TECHNICAL_SETUP_STEP,
        {
            title: 'Development Setup',
            icon: '💻',
            subtitle: 'Repository, tech stack and integrations.',
            fields: [
                field('projectAssets', 'repositoryPreference', 'GitHub / GitLab Username or Repository Link', {
                    placeholder: 'e.g. github.com/username or @username',
                }),
                field('projectAssets', 'techStack', 'Preferred Tech Stack', {
                    placeholder: 'e.g. MERN Stack, Next.js with Tailwind, Django',
                }),
                field('projectAssets', 'thirdPartyApis', 'Required Integrations / Third-party APIs', {
                    placeholder: 'e.g. Stripe, SendGrid, Auth0',
                }),
                field('projectAssets', 'setupNotes', 'Additional Setup Notes (optional)', {
                    type: 'textarea',
                    placeholder: 'Any specific requirements or instructions…',
                }),
            ],
        },
    ],
    designer: [
        COMPANY_STEP,
        {
            ...BRAND_ASSETS_STEP,
            title: 'Brand Identity',
            fields: [
                ...BRAND_ASSETS_STEP.fields,
                field('projectAssets', 'targetAudience', 'Target Audience Description', {
                    placeholder: 'e.g. Young professionals, tech startups',
                }),
            ],
        },
        {
            title: 'Design Inspiration',
            icon: '✨',
            subtitle: 'Websites, layouts and visual references you love.',
            fields: [
                field('technicalDetails', 'inspirationWebsites', 'Design Inspiration / Websites You Like', {
                    placeholder: 'e.g. apple.com, stripe.com, awwwards.com',
                }),
                field('technicalDetails', 'layoutStyle', 'Layout Style Preference', {
                    placeholder: 'e.g. clean/minimal, bold/brutalist, corporate, luxury',
                }),
                field('technicalDetails', 'brandValues', 'Brand Values / Keywords', {
                    placeholder: 'e.g. Innovative, trust-worthy, approachable',
                }),
                field('technicalDetails', 'additionalDesignNotes', 'Additional Design Notes (optional)', {
                    type: 'textarea',
                    placeholder: 'Fonts, visual references, layout sketches…',
                }),
            ],
        },
    ],
    marketer: [
        COMPANY_STEP,
        {
            title: 'Audience & Goals',
            icon: '🎯',
            subtitle: 'Who you want to target and what you want to achieve.',
            fields: [
                field('projectAssets', 'targetAudience', 'Target Audience Description', {
                    placeholder: 'Who are your ideal clients/buyers?',
                }),
                field('projectAssets', 'primaryGoals', 'Core Campaign Goals', {
                    placeholder: 'e.g. Brand awareness, lead gen, SaaS signups',
                }),
                field('projectAssets', 'competitors', 'Top 2–3 Competitors', {
                    placeholder: 'Competitor URLs or names',
                }),
                field('projectAssets', 'logoUrl', 'Logo URL (optional)', { type: 'url', placeholder: 'https://…' }),
            ],
        },
        {
            title: 'Campaign Setup',
            icon: '📣',
            subtitle: 'Social channels, monthly budget and competitor landscape.',
            fields: [
                field('technicalDetails', 'monthlyBudget', 'Estimated Monthly Ad Budget', {
                    placeholder: 'e.g. $1000–$3000, or N/A',
                }),
                field('technicalDetails', 'socialChannels', 'Social Channels to Target', {
                    placeholder: 'e.g. Instagram, Facebook, LinkedIn, TikTok',
                }),
                field('technicalDetails', 'adPlatforms', 'Preferred Ad Platforms', {
                    placeholder: 'e.g. Meta Ads Manager, Google Search Ads, TikTok Ads',
                }),
                field('technicalDetails', 'marketingNotes', 'Additional Campaign Notes (optional)', {
                    type: 'textarea',
                    placeholder: 'Current campaigns, historical performance…',
                }),
            ],
        },
    ],
    // agency, consultant, and "other" all use the generic default shape
    other: [COMPANY_STEP, BRAND_ASSETS_STEP, TECHNICAL_SETUP_STEP],
};

/** Returns the ordered list of steps for a given freelancer profileType. */
export function getSteps(profileType) {
    return STEPS_BY_PROFILE[profileType] || STEPS_BY_PROFILE.other;
}

/** Returns every field across all steps, flattened — useful for validation. */
export function getAllFields(profileType) {
    return getSteps(profileType).flatMap((step) => step.fields);
}

/** Builds an empty { companyInfo: {...}, projectAssets: {...}, technicalDetails: {...} } shape. */
export function buildEmptyForm(profileType) {
    const empty = { companyInfo: {}, projectAssets: {}, technicalDetails: {} };
    for (const { section, key } of getAllFields(profileType)) {
        empty[section][key] = '';
    }
    return empty;
}

/** Merges a (possibly partial/undefined) previous submission into the empty form shape. */
export function mergeSubmissionIntoForm(profileType, previousSubmissionData) {
    const merged = buildEmptyForm(profileType);
    if (!previousSubmissionData) return merged;
    for (const section of ['companyInfo', 'projectAssets', 'technicalDetails']) {
        const source = previousSubmissionData[section];
        if (!source) continue;
        for (const key of Object.keys(merged[section])) {
            if (typeof source[key] === 'string') merged[section][key] = source[key];
        }
    }
    return merged;
}

/** Returns the first field (section, key, label) that's required but empty, or null. */
export function findFirstMissingRequiredField(profileType, stepIndex, formData) {
    const step = getSteps(profileType)[stepIndex];
    if (!step) return null;
    return (
        step.fields.find(
            (f) => f.required && !formData[f.section]?.[f.key]?.trim()
        ) || null
    );
}