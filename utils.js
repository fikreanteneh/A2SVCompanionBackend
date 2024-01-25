export function columnToLetter(column) {
    let temp = 0;
    let letter = "";
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}

export function letterToColumn(letter) {
    let column = 0;
    const length = letter.length;
    for (let i = 0; i < length; i++) {
        column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column;
}


export const envs = {
    MONGODB_CONNECTION_STRING:"mongodb+srv://a2svremoterecruitment:RemotePassword@cluster0.d2xqtlh.mongodb.net/?retryWrites=true&w=majority",
MONGODB_DB_NAME: "G5REMOTE",
MAIN_SHEET_NAME:"Remote A2SV - G5 Main Sheet",
SHEET_APPSCRIPT_DEPLOYMENT:"AKfycbydXMcrx18Urc5frok0u2iQFkgod3Ah6WpG8sXrplRH1gCA3HFgJzKHSbSWc8_yQ34Bow",
GITHUB_CLIENT_ID:"Iv1.4d417f57ef7e3fc1",
GITHUB_CLIENT_SECRET:"c8ded382a48b5d40fccc18057dd0135f1d22c2bc",
GOOGLE_CREDENTIALS:'{"type": "service_account","project_id": "g5remote","private_key_id": "bd7a4ef0cb31dd6c7dd3dce458bcac1f691f8da3","private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0xVkoVu7ncgZf\n568bY9mLuMScbj0LvPZ1umoK5J2uBXWsGXWx6iN7CcVBcu7Ag3J5I1dh+W0q4n0V\n1kr66VTzhuZG+tEZSEtIlhPwrmu+gqpGycRZx2WbwbbHz0VUf9CkXLxjnNwIMcnD\nT8Nt0oEpMzB6NqhULUI0Nu7FtSux7MPy3tFoS3C9McHgKKAZH0978CO7KMBjL68n\nsG6GwWjsrjE6z10gvU6aBjMVC8LhxODNfwTaM73nhaF/gGXYRK3CxK48hIdjQq0j\ne2I6V5/w+/ow2Kghs3lqnwDC9bieJpb0K8mER013BO+VvJZz5ifeQW5BjC7zXbPG\nAH1rnsX5AgMBAAECggEADIGSt328LXrwAfaPYL+5rzbrMz9VLdi23FI3P+WtGvr5\ntxxTzik6pyp34R1Icz0k0EinpPmSmeLtcHNQ4Kb/35E3oTV8/djIjI8FdiM7BQUZ\nLqiK0wM+flYahRxL2Zq2Hojj56hUeKSpJr//7zsfAHCwK+RYJOq0p9QdFMSB718q\nKQv9bYDGJP0hwh5SVLDZEb1d+FBBCTXwd4TO/EWtjLmZzsbfHFR1s1K4PxI8yVxl\nO8/w75D53oujsToXvfk4dlXlhB8rh4dzSfk8dbQ+f1mUynfp29TY9AMj/vMQcDDm\nI91kdP8VtjoanSg4JhioMGv7v/H0eGYcJFadWiya4QKBgQDijLTM2A/TMobwGGC2\nErxvT/vdHFwvlmZwI/R4b8eNkKHaro4qxb0mQBGBI0vKMmEGqtdIF6eAO7yWdVBk\ntq+qclJVEolJphVVERV4MC7JoVdmJtdYEq6uvqOBl0aNYX1AKgbBxOXSbqmiKI4c\nQJoAevMwGtp+54L89nxgfumFzQKBgQDMRS6CDR211XbU/A97o/ZeY2AinYtU+urN\njlVltgycxs9UJ7alBN0JTzRLwmg8sDoJU3w4GfTXRoUMkmL92kW3HX9XztACwLxC\nphLj43/j/3ZFcNbykk9j+Y5pQhiszbGtPykwt51nT0ifVqmatHAMOaBxMnR1iAni\n02z7HZtU3QKBgQDXvXrnn9HiI7nQpsZiXRFJR3foJnu7bZR7siG7F2eHbnZT0+ra\n3Je190k0GzKviK5RNRvyMWR3f2umNG2smzRKMrgo/4/xrNGfwrcZT3ke1iBuzQpB\nevkSu8TlQfQT6wTlt5/bou/hJzUvkUNTsEl3r54q70enljxtPSVQl0s2+QKBgF1r\nNj3b6b6DBXmaXSpabg30vL6X9mTC7Cdd9MgzXclFUwRVtT3632umgXA0VJ+MqL4j\nJCg0FrltUuPQ/tzBuihooRhzSMY5ht+kO/dkz9RhvKE9XdBKAWzjcLHKvKYq3Bsz\nS48wKhhZNglJBP/vjV7J7ApY3NHziTHnJ2wgui0xAoGAExPAeM+C7cYJJ78Kh/KI\nG0X7GUOBS2Bz84kQDOYN5UOFyfiqtABZukqshaZLWMX6edeOSgMdR7RwymKQKcEw\nQMurnKm+dtf4PQpeumsEvWcjHfMNPmiJ1G1Ly8l6R0x5S9/RZrCRW7Oc8ITxtWsi\nvnsotgDa/deeOHl+5FAwpVc=\n-----END PRIVATE KEY-----\n","client_email": "g5remote@g5remote.iam.gserviceaccount.com","client_id": "102905441967865997143","auth_uri": "https://accounts.google.com/o/oauth2/auth","token_uri": "https://oauth2.googleapis.com/token","auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/g5remote%40g5remote.iam.gserviceaccount.com","universe_domain": "googleapis.com"}'  
} 