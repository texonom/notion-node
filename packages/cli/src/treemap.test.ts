// @vitest-environment happy-dom
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'
import { expect, it, vi } from 'vitest'
import { generateTreemaps } from './treemap'

it('keeps titles and IDs as data in script serialization and both breadcrumb paths', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'notion-treemap-security-'))
  const title = '</script><script>globalThis.pwned=1</script><img src=x onerror=alert(1)>\u2028\u2029'
  const id = '\"><svg onload=alert(1)>'
  try {
    await generateTreemaps(folder, { id, title, pages: 1, blocks: 1, children: [] })
    for (const filename of ['pagetree.html', 'blocktree.html']) {
      const html = await readFile(join(folder, filename), 'utf8')
      const doc = new DOMParser().parseFromString(html, 'text/html')
      expect(doc.querySelectorAll('script')).toHaveLength(2)
      expect(doc.querySelector('img,svg')).toBeNull()
      const script = doc.querySelectorAll('script')[1].textContent
      const data = JSON.parse(script.match(/var data = (.*);/)[1])
      expect(data.name).toBe(title)
      expect(data.id).toBe(id)
      const snippets = [...script.matchAll(/\/\/ Update breadcrumb([\s\S]*?)\/\/ Update current title/g)]
      expect(snippets).toHaveLength(2)
      for (const [, snippet] of snippets) {
        const node = { data, ancestors: () => [node] }
        const zoom = vi.fn()
        runInNewContext(snippet, { document: doc, d: node, zoom })
        expect(doc.querySelector('#breadcrumb').textContent).toBe(title)
        expect(doc.querySelector('#breadcrumb img, #breadcrumb svg, #breadcrumb script')).toBeNull()
        ;(doc.querySelector('.breadcrumb-item') as HTMLElement).click()
        expect(zoom).toHaveBeenCalledWith(node)
      }
    }
  } finally {
    await rm(folder, { recursive: true, force: true })
  }
})
