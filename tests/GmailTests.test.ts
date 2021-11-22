import {GmailUrlDecoder} from "@main/google/GmailUrlDecoder";


test('Hashed value to ID', () => {
    let decoder = new GmailUrlDecoder();
    expect(decoder.parseUrlEncoding('FMfcgzGlksGwwZJpPFLNLmLzmZCclDPB')).toBe('17D2EE6039DC7D2C');
});
test('Full URL to ID', () => {
      let decoder = new GmailUrlDecoder();
      expect(decoder.parseUrlEncoding('https://mail.google.com/mail/u/0/#inbox/FMfcgzGlksGwwZJpPFLNLmLzmZCclDPB')).toBeNull();
});
