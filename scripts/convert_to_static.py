from pathlib import Path
import re

root = Path(r'C:\xampp\htdocs\Homemoney')

files = [
    ('index.php', 'index.html'),
    ('cam-on.php', 'cam-on.html'),
    ('vay-tien-qua-icloud.php', 'vay-tien-qua-icloud.html'),
    ('admin-contact.php', 'admin-contact.html'),
    ('admin.php', 'admin.html'),
]

for src_name, dst_name in files:
    src = root / src_name
    dst = root / dst_name
    text = src.read_text(encoding='utf-8')

    # Strip leading PHP block if present
    text = re.sub(r'^<\?php.*?\?>\s*', '', text, flags=re.S)

    # Replace PHP echo expressions inside links with placeholders and data attrs
    text = text.replace('https://zalo.me/<?= rawurlencode($contact[\'zalo\']) ?>', '#')
    text = text.replace('https://zalo.me/<?= rawurlencode($contact[\'zalo\']) ?>"', '#"')
    text = text.replace('href="https://zalo.me/<?= rawurlencode($contact[\'zalo\']) ?>"', 'href="#" data-contact="zalo"')
    text = text.replace('href="https://zalo.me/<?= rawurlencode($contact[\'zalo\']) ?>" target="_blank"', 'href="#" data-contact="zalo" target="_blank"')
    text = text.replace('href="https://www.facebook.com/profile.php?id=100069526895693"', 'href="#" data-contact="facebook"')
    text = text.replace('href="https://www.facebook.com/profile.php?id=100069526895693" target="_blank"', 'href="#" data-contact="facebook" target="_blank"')
    text = text.replace('https://www.facebook.com/profile.php?id=100069526895693', '#')

    # Remove remaining PHP tags and echo expressions
    text = re.sub(r'<\?php\b.*?\?>', '', text, flags=re.S)
    text = text.replace('<?=', '')
    text = text.replace('?>', '')
    text = text.replace('<?= htmlspecialchars', '')
    text = text.replace('?>', '')

    if '</body>' in text.lower():
        script = """
<script>
(function () {
  const contactUrl = './data/contact-settings.json';
  const fallbackZalo = 'https://zalo.me/0345345553';
  const fallbackFacebook = 'https://www.facebook.com/profile.php?id=100069526895693';

  fetch(contactUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Contact settings not found');
      }
      return response.json();
    })
    .then(function (data) {
      const zaloValue = (data.zalo || '').trim();
      const facebookValue = (data.facebook || '').trim();
      const zaloHref = zaloValue ? 'https://zalo.me/' + encodeURIComponent(zaloValue) : fallbackZalo;
      const facebookHref = facebookValue || fallbackFacebook;

      document.querySelectorAll('[data-contact="zalo"]').forEach(function (el) {
        el.href = zaloHref;
      });
      document.querySelectorAll('[data-contact="facebook"]').forEach(function (el) {
        el.href = facebookHref;
      });
    })
    .catch(function () {
      document.querySelectorAll('[data-contact="zalo"]').forEach(function (el) {
        el.href = fallbackZalo;
      });
      document.querySelectorAll('[data-contact="facebook"]').forEach(function (el) {
        el.href = fallbackFacebook;
      });
    });
})();
</script>
"""
        text = text.replace('</body>', script + '</body>', 1)

    dst.write_text(text, encoding='utf-8')

(root / 'vercel.json').write_text('''{
  "rewrites": [
    { "source": "/cam-on", "destination": "/cam-on.html" },
    { "source": "/vay-tien-qua-icloud", "destination": "/vay-tien-qua-icloud.html" },
    { "source": "/admin", "destination": "/admin.html" },
    { "source": "/admin-contact", "destination": "/admin-contact.html" }
  ]
}
''', encoding='utf-8')

print('Converted PHP files to static HTML and created vercel.json')
