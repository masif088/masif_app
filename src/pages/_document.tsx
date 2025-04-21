import { Html, Head, Main, NextScript } from "next/document";
import NoSsr from "utils/NoSsr";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/assets/images/favicon.png" type="image/x-icon" />
        <link rel="shortcut icon" href="/assets/images/favicon.png" type="image/x-icon" />
        <link href="https://fonts.googleapis.com/css?family=Rubik:400,400i,500,500i,700,700i&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,500,500i,700,700i,900&display=swap" rel="stylesheet" />
        <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
