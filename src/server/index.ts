import { getRequestMiddleware } from './getRequestMiddleware';
import { config } from 'dotenv';
config(); //loads the configuration from the .env file
import express from 'express';
import sslRedirect from 'heroku-ssl-redirect'
import helmet from 'helmet';
import compression from 'compression';
import { api } from './api';
import session from "cookie-session";
import csrf from "csurf";
import { SignInController } from '../app/users/SignInController';

async function startup() {
    const app = express();
    app.use(sslRedirect());
    app.use(session({
        secret: process.env["NODE_ENV"] === "production" ? process.env['SESSION_SECRET'] : "my secret"
    }));
    app.use(compression());
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use('/api', (req, res, next) => {
        //disable csrf for the `currentUser` backend method that is the first call of the web site.
        const currentUserMethodName: keyof typeof SignInController = 'currentUser';
        if (req.path === '/' + currentUserMethodName)
            csrf({ ignoreMethods: ["post"] })(req, res, next);
        else
            csrf({})(req, res, next);
    });
    app.use("/api", (req, res, next) => {
        res.cookie("XSRF-TOKEN", req.csrfToken());
        next();
    });
    app.use(getRequestMiddleware);
    app.use(api);
    app.get('/api/pdf/:id.pdf',
        (req, res) => res.sendFile((process.cwd() + '/tmp/' + req.params['id'] + '.pdf')))

    app.use(express.static('dist/angular-starter-project'));
    app.use('/*', async (req, res) => {
        req.session
        if (req.headers.accept?.includes("json")) {
            console.log(req);
            res.status(404).json("missing route: " + req.originalUrl);
            return;
        }
        try {
            res.sendFile(process.cwd() + '/dist/angular-starter-project/index.html');
        } catch (err) {
            res.sendStatus(500);
        }
    });
    let port = process.env['PORT'] || 3002;
    app.listen(port);
}
startup();
