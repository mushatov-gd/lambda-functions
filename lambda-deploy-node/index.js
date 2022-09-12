//dev 5
const fetch = require('./fetch.js');

const APIStrategy = {
    stage: 'https://test.stage.grib.net',
    production: 'https://www.grib.com',
};
const WebsiteStrategy = {
    stage: 'https://ir.stage.grib.net', // replace with ir stage env with prod deployment if it ever becomes a reality
    production: 'https://ir.grib.com',
};
const pressReleasesClearCacheEndpoint = '/api/financial/press-releases?password=blabla';
const butterClearCacheEndpoint = '/api/butter/cache';
const websiteClearCacheEndpoint = '/document-cache';
const api = APIStrategy[process.env.ENVIRONMENT ?? 'stage'] ?? 'https://test.stage.grib.net';
const website = WebsiteStrategy[process.env.ENVIRONMENT ?? 'stage'] ?? 'https://ir.stage.grib.net';

exports.handler = async (event, context) => {
    let body = null;
    try {
        body = JSON.parse(event?.body);
    } catch (e) {
        console.error(JSON.stringify({ type: 'error', reason: 'ir-clear-cache-lambda', description: 'Failed to parse event body', message: e.toString() }));
    }
    console.log(JSON.stringify({ type: 'ir-notifier', reason: 'ir-clear-cache-lambda', message: `Process API Gateway request for "${JSON.stringify(body)}"` }));
    
    const pageType = body?.data?.page_type;
    let e;
    if (pageType === 'investors_press_release') {
        e = await clearCache(true);
    } else if (pageType === 'investors_events') {
        e = await clearCache();
    }

    return {
        statusCode: 200,
        body: JSON.stringify(e),
    };
};

async function clearCache(clearPressReleases) {
    try {
        if (clearPressReleases) {
            await fetch('DELETE', `${api}${pressReleasesClearCacheEndpoint}`);
        }
        await fetch('DELETE', `${api}${butterClearCacheEndpoint}`);
        await fetch('DELETE', `${website}${websiteClearCacheEndpoint}`);
    } catch (e) {
        console.error(JSON.stringify({ type: 'error', reason: 'ir-clear-cache-lambda',  message: JSON.stringify(e) }));
        
        return e;
    }
    console.log(JSON.stringify({ 
        type: 'ir-notifier',
        reason: 'ir-clear-cache-lambda',
        message: `Successfully cleared cache for ${clearPressReleases ? 'investor press-releases' : 'investor events'}`
    }));
    return { ok: 'true' };
}