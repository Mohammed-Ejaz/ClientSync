// Whitelists and validates the fields a client (public) or freelancer
// (authenticated) is allowed to write into a ClientSubmission document.
// Nothing outside this list is ever persisted, regardless of what the
// request body contains.

const FIELDS = {
    companyInfo: ['address', 'contactEmail', 'phone', 'website'],
    projectAssets: [
        'primaryColor', 'fontFamily', 'logoUrl',
        'repositoryPreference', 'techStack', 'thirdPartyApis', 'setupNotes',
        'targetAudience', 'primaryGoals', 'competitors',
    ],
    technicalDetails: [
        'domainName', 'hostingProvider', 'cmsPlatform', 'serverRegion',
        'inspirationWebsites', 'layoutStyle', 'brandValues', 'additionalDesignNotes',
        'monthlyBudget', 'socialChannels', 'adPlatforms', 'marketingNotes',
    ],
};

const MAX_FIELD_LENGTH = 1000;
const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HTTP_URL = /^https?:\/\/.+/i;

/**
 * @param {object} body - raw req.body
 * @param {object} [opts]
 * @param {boolean} [opts.partial] - if true, a section absent from `body` is
 *   left out of the result entirely instead of being zeroed out. Use this
 *   for PATCH-style partial updates (e.g. the freelancer editing one tab).
 * @returns {{ data: object } | { error: string }}
 */
export function sanitizeSubmission(body = {}, { partial = false } = {}) {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        return { error: 'Invalid request body.' };
    }

    const data = {};

    for (const [section, keys] of Object.entries(FIELDS)) {
        const input = body[section];

        if (input === undefined) {
            if (partial) continue;
            data[section] = {};
            continue;
        }

        if (typeof input !== 'object' || input === null || Array.isArray(input)) {
            return { error: `"${section}" must be an object.` };
        }

        data[section] = {};
        for (const key of keys) {
            if (input[key] === undefined) continue;
            if (typeof input[key] !== 'string') {
                return { error: `"${section}.${key}" must be a string.` };
            }
            data[section][key] = input[key].trim().slice(0, MAX_FIELD_LENGTH);
        }
    }

    const primaryColor = data.projectAssets?.primaryColor;
    if (primaryColor && !HEX_COLOR.test(primaryColor)) {
        return { error: 'Primary color must be a valid hex code (e.g. #6366F1).' };
    }

    const logoUrl = data.projectAssets?.logoUrl;
    if (logoUrl && !HTTP_URL.test(logoUrl)) {
        return { error: 'Logo URL must start with http:// or https://.' };
    }

    const contactEmail = data.companyInfo?.contactEmail;
    if (contactEmail && !EMAIL.test(contactEmail)) {
        return { error: 'Contact email is not a valid email address.' };
    }

    const website = data.companyInfo?.website;
    if (website && !HTTP_URL.test(website)) {
        return { error: 'Website must start with http:// or https://.' };
    }

    return { data };
}