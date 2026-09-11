const opening = /<(think|analysis)\b[^>]*>/i;
const closing = /<\/(think|analysis)\s*>/i;
const tagPrefixes = ["<think", "<analysis"];

function safeTail(value: string) {
  return Math.max(0, ...tagPrefixes.map((prefix) => {
    for (let size = Math.min(prefix.length - 1, value.length); size > 0; size--) if (value.endsWith(prefix.slice(0, size))) return size;
    return 0;
  }));
}

function clean(value: string) {
  return value
    .replace(/\[[^\]]*\]\(https?:\/\/wa\.me\/[^)]*\)/gi, "")
    .replace(/(?:اطلب|تواصل).*?(?:مساعد(?:اً)? ذكي(?:اً)?|whatsapp|واتساب).*/gi, "");
}

export class ResponseGuard {
  private buffer = "";
  private hidden = false;

  push(chunk: string) {
    this.buffer += chunk;
    let output = "";
    while (this.buffer) {
      if (this.hidden) {
        const match = closing.exec(this.buffer);
        if (!match || match.index === undefined) {
          this.buffer = this.buffer.slice(-16);
          break;
        }
        this.buffer = this.buffer.slice(match.index + match[0].length);
        this.hidden = false;
        continue;
      }
      const match = opening.exec(this.buffer);
      if (match && match.index !== undefined) {
        output += this.buffer.slice(0, match.index);
        const end = this.buffer.indexOf(">", match.index);
        if (end < 0) {
          this.buffer = this.buffer.slice(match.index);
          break;
        }
        this.buffer = this.buffer.slice(end + 1);
        this.hidden = true;
        continue;
      }
      const tail = safeTail(this.buffer);
      output += this.buffer.slice(0, this.buffer.length - tail);
      this.buffer = this.buffer.slice(this.buffer.length - tail);
      break;
    }
    return clean(output);
  }

  finish() {
    const output = this.hidden ? "" : this.buffer.replace(/<(think|analysis)\b[^>]*>/gi, "");
    this.buffer = "";
    this.hidden = false;
    return clean(output);
  }
}
