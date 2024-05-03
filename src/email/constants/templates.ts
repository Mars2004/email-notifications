export const templates: Record<string, string> = {
  expiration: `
    <html lang='en'>
        <head>
            <meta charset='utf-8' />
            <style>
                /* TODO: CREATE STYLES */
            </style>
        </head>
        <body>
            <h1 class='title'>IceWarp Cloud Trial expires in 7 days</h1>
            <p class='content'>
                Hi,
                <br />
                <br />
                This is to inform you that your IceWarp Cloud trial will expire in 7 days.
                To learn how to convert it to production deployment, please <a href="{{link}}">click here</a>.
                <br />
                <br />
                Kind regards,
                <br />
                Your IceWarp Team
            </p>
        </body>
    </html>
  `,
};
