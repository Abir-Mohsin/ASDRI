/**
 * Intelligently converts raw plain text, Markdown, or HTML content into clean, 
 * beautifully styled paragraph-by-paragraph HTML for ASDRI institutional pages and notices.
 */
export function formatContentHtml(rawContent: string): string {
  if (!rawContent || !rawContent.trim()) {
    return '';
  }

  const trimmed = rawContent.trim();

  // Check if content already contains HTML block tags
  const hasHtmlBlockTags = /<\/?(p|div|h[1-6]|ul|ol|li|blockquote|table|section|article)\b[^>]*>/i.test(trimmed);
  
  if (hasHtmlBlockTags) {
    // Enhance existing HTML paragraphs with proper spacing and typography classes
    let enhanced = trimmed;
    
    // Ensure <p> tags without classes have generous spacing and line height
    enhanced = enhanced.replace(/<p(\s+[^>]*)?>/gi, (match, attrs) => {
      if (attrs && attrs.includes('class=')) {
        return match;
      }
      return '<p class="text-slate-700 leading-relaxed mb-4 text-sm sm:text-base font-sans">';
    });
    
    // Ensure <blockquote> tags have rich callout styling
    enhanced = enhanced.replace(/<blockquote(\s+[^>]*)?>/gi, (match, attrs) => {
      if (attrs && attrs.includes('class=')) return match;
      return '<blockquote class="my-5 p-4 sm:p-5 bg-amber-50/90 border-l-4 border-amber-500 rounded-r-2xl text-amber-950 font-serif italic shadow-2xs leading-relaxed text-sm sm:text-base">';
    });
    
    // Ensure headings have strong branding
    enhanced = enhanced.replace(/<h2(\s+[^>]*)?>/gi, (match, attrs) => {
      if (attrs && attrs.includes('class=')) return match;
      return '<h2 class="text-xl md:text-2xl font-bold text-[#064e3b] mt-6 mb-3 font-serif border-b border-emerald-100/60 pb-1.5">';
    });
    enhanced = enhanced.replace(/<h3(\s+[^>]*)?>/gi, (match, attrs) => {
      if (attrs && attrs.includes('class=')) return match;
      return '<h3 class="text-lg md:text-xl font-bold text-[#064e3b] mt-5 mb-2 font-serif">';
    });
    
    return enhanced;
  }

  // Normalize Windows/Unix newlines
  const normalized = trimmed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split content by blank lines into distinct logical paragraphs
  const rawParagraphs = normalized.split(/\n{2,}/);

  const formattedBlocks = rawParagraphs.map((para) => {
    const trimmedPara = para.trim();
    if (!trimmedPara) return '';

    const lines = trimmedPara.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return '';

    // Check if entire paragraph is a bullet list (starts with -, *, •, or ✅)
    const isBulletList = lines.every(line => /^[-*•✅📌\u2022]\s*/.test(line));
    if (isBulletList) {
      const items = lines.map(line => {
        const cleaned = line.replace(/^[-*•✅📌\u2022]\s*/, '');
        return `<li class="flex items-start gap-2.5 text-slate-700 font-medium text-sm sm:text-base">
          <span class="text-emerald-600 font-bold text-base shrink-0 mt-0.5">✓</span>
          <span class="leading-relaxed">${formatInlineStyles(cleaned)}</span>
        </li>`;
      }).join('\n');
      return `<ul class="space-y-3 my-5 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/80 shadow-2xs">${items}</ul>`;
    }

    // Check if entire paragraph is a numbered list (starts with 1., 2., ১., ২.)
    const isNumberedList = lines.every(line => /^(\d+|[১-৯]+)[\.\)]\s*/.test(line));
    if (isNumberedList) {
      const items = lines.map(line => {
        const match = line.match(/^([0-9]+|[১-৯]+)[\.\)]\s*(.*)/);
        const num = match ? match[1] : '•';
        const text = match ? match[2] : line;
        return `<li class="flex items-start gap-3 text-slate-700 font-medium text-sm sm:text-base">
          <span class="w-6 h-6 rounded-full bg-[#064e3b] text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">${num}</span>
          <span class="pt-0.5 leading-relaxed">${formatInlineStyles(text)}</span>
        </li>`;
      }).join('\n');
      return `<ol class="space-y-3.5 my-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 shadow-2xs">${items}</ol>`;
    }

    // Check if paragraph is a single heading
    if (lines.length === 1 && (/^#{1,3}\s+/.test(lines[0]) || /^(বিশেষ প্রশাসনিক ঘোষণা|পরিচালক মহোদয়ের বাণী|নোটিশ|বিজ্ঞপ্তি|শর্তাবলী|পাঠ্যক্রমসমূহ|ভর্তি সংক্রান্ত তথ্য|কোর্স কারিকুলাম|জরুরি নির্দেশিকা):/i.test(lines[0]))) {
      const text = lines[0].replace(/^#{1,3}\s+/, '');
      return `<h3 class="text-lg md:text-xl font-bold text-[#064e3b] font-serif mt-6 mb-3 border-b border-emerald-100/80 pb-2 flex items-center gap-2">
        <span class="w-2 h-5 bg-amber-500 rounded-full inline-block shrink-0"></span>
        <span>${formatInlineStyles(text)}</span>
      </h3>`;
    }

    // Check if paragraph is a quote or Hadith / Quran translation (starts with " or “ or >)
    if (/^[“"»]/.test(trimmedPara) || /^>\s+/.test(trimmedPara)) {
      const quoteText = trimmedPara.replace(/^>\s+/, '');
      return `<blockquote class="my-5 p-4 sm:p-5 bg-amber-50/90 border-l-4 border-amber-500 rounded-r-2xl text-amber-950 font-serif italic shadow-2xs leading-relaxed text-sm sm:text-base">
        ${formatInlineStyles(quoteText)}
      </blockquote>`;
    }

    // Check if paragraph is a Callout / Announcement Box (starts with 📢, ⚠️, 📌, 📍, 🗓️)
    if (/^[🗓️📢⚠️📌📍💡]/.test(trimmedPara)) {
      return `<div class="p-4 sm:p-5 bg-amber-50/90 border border-amber-200/80 rounded-2xl my-5 text-amber-950 shadow-2xs flex items-start gap-3">
        <span class="text-xl shrink-0 mt-0.5">📌</span>
        <div class="leading-relaxed text-sm sm:text-base font-medium">${formatInlineStyles(trimmedPara)}</div>
      </div>`;
    }

    // Check for Contact / Location box
    if (/^(স্থান|ঠিকানা|যোগাযোগ|মোবাইল|ফোন|ইমেইল):/i.test(lines[0])) {
      return `<div class="p-4 sm:p-5 bg-emerald-50/70 border-l-4 border-[#064e3b] rounded-r-2xl my-5 text-[#064e3b] text-sm sm:text-base font-medium leading-relaxed shadow-2xs">
        ${lines.map(l => formatInlineStyles(l)).join('<br />')}
      </div>`;
    }

    // Single standalone link line
    if (lines.length === 1 && /^https?:\/\/[^\s]+$/.test(lines[0])) {
      return `<div class="my-5"><a href="${lines[0]}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-3 bg-[#064e3b] text-amber-300 hover:bg-emerald-900 font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-sm">🔗 লিঙ্কে প্রবেশ করুন: ${lines[0]} →</a></div>`;
    }

    // Standard Multi-line or Single-line Paragraph
    // Joining lines within the same paragraph with <br /> preserves user-entered linebreaks while maintaining distinct paragraphs
    const paragraphContent = lines.map(line => formatInlineStyles(line)).join('<br />');
    return `<p class="text-slate-700 leading-relaxed mb-4 text-sm sm:text-base font-sans">${paragraphContent}</p>`;
  });

  return formattedBlocks.filter(Boolean).join('\n\n');
}

/**
 * Format inline text styles like links, bold, and highlights
 */
function formatInlineStyles(text: string): string {
  if (!text) return '';

  let result = text;

  // Convert raw URLs into clickable links
  result = result.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-emerald-700 font-bold underline hover:text-emerald-900 break-all">$1</a>'
  );

  // Convert **bold** or *italic* if markdown style used
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#064e3b]">$1</strong>');
  
  return result;
}

