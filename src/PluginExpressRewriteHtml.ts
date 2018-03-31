import * as cheerio from "cheerio";
import * as interceptor from "express-interceptor";

const bodyInterceptor = interceptor((req: any, res: any) => {
    return {
        // Only HTML responses will be intercepted
        isInterceptable() {
            return /text\/html/.test(res.get("Content-Type"));
        },

        // Appends a paragraph at the end of the response body
        intercept(body: any, send: any) {
            const $document = cheerio.load(body);
            $document("body").append(`\n<script src="./__reload.js"></script>\n`);

            send($document.html());
        },
    };
});

export default bodyInterceptor;
