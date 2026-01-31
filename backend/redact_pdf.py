import fitz  # PyMuPDF
import re

REDACT_FILL = (0, 0, 0)  # black fill for redaction

# Indian mobile: 6/7/8/9 followed by 9 digits
INDIAN_PHONE = re.compile(r"\b[6-9]\d{9}\b")
# Aadhar: 12 digits, optional spaces (xxxx xxxx xxxx or xxxxxxxxxxxx)
AADHAR = re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b")
# Email
EMAIL = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
# Bank account / long account numbers: 10-18 digits
ACCOUNT_NUMBER = re.compile(r"\b\d{10,18}\b")
# Age: word "age" then 1-3 digit number
AGE = re.compile(r"\bage\s*\d{1,3}\b", re.IGNORECASE)
# Salary / pay in any currency: rupee, dollar, euro, dinar, pound, etc.
SALARY = re.compile(
    r"(?:"
    r"\b(?:salary|sal|pay|wage|income)\s*[:\-]?\s*\d[\d,.]*\s*(?:lakh|lac|k|cr|million|mn|bn)?\b|"
    r"[₹$€£]\s*\d[\d,.]*\s*(?:lakh|lac|k|cr|m|mn|bn)?\b|"
    r"\b(?:rs\.?|inr|rupee|rupees)\s*[:\-]?\s*\d[\d,.]*\s*(?:lakh|lac|k|cr)?\b|"
    r"\b(?:usd|\$|dollar|dollars)\s*[:\-]?\s*\d[\d,.]*\s*(?:k|m|mn|million|bn)?\b|"
    r"\b(?:eur|€|euro|euros)\s*[:\-]?\s*\d[\d,.]*\s*(?:k|m|mn|million)?\b|"
    r"\b(?:gbp|£|pound|pounds)\s*[:\-]?\s*\d[\d,.]*\s*(?:k|m|mn)?\b|"
    r"\b(?:dinar|dinars|kwd|bhd|jod|iqd|aed|sar)\s*[:\-]?\s*\d[\d,.]*\s*(?:k|m)?\b"
    r")",
    re.IGNORECASE,
)
# Bank names (common Indian banks)
BANK_NAMES = re.compile(
    r"\b(SBI|HDFC|ICICI|Axis Bank|Kotak|PNB|Bank of Baroda|BOB|Canara|Union Bank|Indian Bank|Central Bank|IDBI|Yes Bank|IndusInd|Federal Bank|Bandhan Bank)\b",
    re.IGNORECASE,
)

# Names: only 2–3 word patterns that look like person names
# Title Case: John Smith, Mary Jane Watson
NAME_TITLE_CASE = re.compile(r"\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b")
# ALL CAPS: JOHN SMITH, JANE DOE
NAME_ALL_CAPS = re.compile(r"\b[A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?\b")
# All lowercase 2–3 words: first word 4+ chars to avoid "the file", "of the"
NAME_LOWERCASE = re.compile(r"\b[a-z]{4,}\s+[a-z]{3,}(?:\s+[a-z]{3,})?\b")
# Mixed case / Mr. Mrs. Dr. + name
NAME_TITLE_PREFIX = re.compile(
    r"\b(?:Mr|Mrs|Ms|Miss|Dr|Prof)\.?\s+[A-Za-z]+(?:\s+[A-Za-z]+)?\b",
    re.IGNORECASE,
)


def is_sensitive(text: str) -> bool:
    """Redact only: names (any case), email, Indian 10-digit phone, Aadhar,
    account number, age, bank names, bank account number, salary."""
    if not text or not text.strip():
        return False
    s = text.strip()

    if EMAIL.search(s):
        return True
    if INDIAN_PHONE.search(s):
        return True
    if AADHAR.search(s):
        return True
    if ACCOUNT_NUMBER.fullmatch(s) and len(s) >= 10:
        return True
    if AGE.search(s):
        return True
    if BANK_NAMES.search(s):
        return True
    if SALARY.search(s):
        return True
    # Names: full match only so we don't redact mid-sentence randomly
    if NAME_TITLE_CASE.fullmatch(s):
        return True
    if NAME_ALL_CAPS.fullmatch(s) and s.isupper():
        return True
    if NAME_LOWERCASE.fullmatch(s):
        return True
    if NAME_TITLE_PREFIX.fullmatch(s):
        return True
    return False


def redact_pdf(input_path, output_path):
    doc = fitz.open(input_path)

    for page in doc:
        text_dict = page.get_text("dict")
        for block in text_dict.get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    span_text = span.get("text", "")
                    if is_sensitive(span_text):
                        rect = fitz.Rect(span["bbox"])
                        page.add_redact_annot(rect, fill=REDACT_FILL)

        for word in page.get_text("words"):
            text = word[4]
            if is_sensitive(text):
                rect = fitz.Rect(word[0], word[1], word[2], word[3])
                page.add_redact_annot(rect, fill=REDACT_FILL)

        page.apply_redactions()

    doc.save(output_path)
    doc.close()
