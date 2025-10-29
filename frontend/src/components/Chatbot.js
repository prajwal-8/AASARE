// frontend/src/components/Chatbot.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../css/chatbot.css'; // Import your CSS file for Chatbot styling

// --- Tiny Markdown-ish formatter (no libs). Handles: code blocks, inline code,
// headings (#,##,###), blockquotes (>), bullets (-/*), numbers (1.), bold **, italic */_,
// links, paragraphs + line breaks. Safe: escapes HTML before formatting.
function formatBotText(raw) {
  if (!raw) return '';

  // 1) escape HTML early
  const esc = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 2) tokenize to lines and parse blocks
  const lines = esc(raw).replace(/\r\n/g, '\n').split('\n');

  const out = [];
  let i = 0;
  let inCode = false;
  let codeLang = '';
  let codeBuffer = [];

  const flushParagraph = (buf) => {
    if (!buf.length) return;
    const text = buf.join('\n');

    // inline: links
    let t = text.replace(
      /((https?:\/\/[^\s)]+)|(\bwww\.[^\s)]+))/gi,
      (m) => {
        const url = m.startsWith('http') ? m : `http://${m}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${m}</a>`;
      }
    );

    // inline: bold ** ** before italic to avoid conflicts
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // inline: italic *text* or _text_
    t = t.replace(/(^|[^\*])\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, '$1<em>$2</em>');
    t = t.replace(/(^|[^_])_(?!\s)(.+?)(?<!\s)_/g, '$1<em>$2</em>');

    // inline: inline code `code`
    t = t.replace(/`([^`]+?)`/g, '<code>$1</code>');

    // line breaks inside paragraph
    t = t.split('\n').map(p => p.trim() === '' ? '' : p).join('<br/>');

    out.push(`<p>${t}</p>`);
  };

  const flushList = (items, ordered = false) => {
    if (!items.length) return;
    const tag = ordered ? 'ol' : 'ul';
    const lis = items.map(li => `<li>${li}</li>`).join('');
    out.push(`<${tag}>${lis}</${tag}>`);
  };

  while (i < lines.length) {
    let line = lines[i];

    // Fenced code block start/end: ```lang
    const fence = line.match(/^```(\S*)\s*$/);
    if (fence) {
      if (!inCode) {
        inCode = true;
        codeLang = fence[1] || '';
        codeBuffer = [];
      } else {
        // end fence
        const codeHtml = codeBuffer.join('\n');
        out.push(
          `<pre><code${codeLang ? ` class="language-${codeLang}"` : ''}>${codeHtml}</code></pre>`
        );
        inCode = false;
        codeLang = '';
        codeBuffer = [];
      }
      i++;
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      i++;
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      const q = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        q.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      const inner = formatBotText(q.join('\n')); // recurse to allow formatting inside
      out.push(`<blockquote>${inner}</blockquote>`);
      continue;
    }

    // Headings
    const h3 = line.match(/^\s*###\s+(.*)$/);
    if (h3) { out.push(`<h3>${h3[1]}</h3>`); i++; continue; }
    const h2 = line.match(/^\s*##\s+(.*)$/);
    if (h2) { out.push(`<h4>${h2[1]}</h4>`); i++; continue; } // slightly smaller
    const h1 = line.match(/^\s*#\s+(.*)$/);
    if (h1) { out.push(`<h4>${h1[1]}</h4>`); i++; continue; } // slightly smaller

    // Horizontal rule
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { out.push('<hr/>'); i++; continue; }

    // Lists (unordered)
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const item = lines[i].replace(/^\s*[-*]\s+/, '');
        items.push(formatBotText(item)); // allow inline nested formatting
        i++;
      }
      flushList(items, false);
      continue;
    }

    // Lists (ordered)
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const item = lines[i].replace(/^\s*\d+\.\s+/, '');
        items.push(formatBotText(item));
        i++;
      }
      flushList(items, true);
      continue;
    }

    // Paragraph block: collect until blank or special block start
    if (line.trim() !== '') {
      const buf = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !/^\s*```/.test(lines[i]) &&
        !/^\s*[-*]\s+/.test(lines[i]) &&
        !/^\s*\d+\.\s+/.test(lines[i]) &&
        !/^\s*>\s?/.test(lines[i]) &&
        !/^\s*#{1,3}\s+/.test(lines[i]) &&
        !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])
      ) {
        buf.push(lines[i]);
        i++;
      }
      flushParagraph(buf);
      continue;
    }

    // blank line
    i++;
  }

  // if an unterminated code fence sneaks through
  if (inCode) {
    const codeHtml = codeBuffer.join('\n');
    out.push(`<pre><code${codeLang ? ` class="language-${codeLang}"` : ''}>${codeHtml}</code></pre>`);
  }

  return out.join('');
}

const Chatbot = () => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/chat_history`, { withCredentials: true });
        setChatHistory(res.data);
      } catch (error) {
        console.error('Error fetching chat history', error);
      }
    };
    fetchChatHistory();
  }, []);

  // Scroll to the bottom of the chat when a new message is added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleInputChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/chatbot`, { question }, { withCredentials: true });
      const newMessage = { role: 'user', message: question };
      const botResponse = { role: 'bot', response: res.data.response };
      setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage, botResponse]); // Append new messages to the end
      setQuestion('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/logout`, {}, { withCredentials: true });
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  return (
    <div className="chatbot-container">
      <h1 className="chatbot-title">Mental Health Chatbot</h1>
      <span className="consultancy-button">
        <a href="/consultants"><button>Consultancy</button></a>
        <a href="/dashboard"><button>Dashboard</button></a> 
      </span>
      <div className="chat-history">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`message ${chat.role}`}>
            <div className="message-bubble">
              {chat.role === 'user' ? (
                <p className="message-text">{chat.message}</p>
              ) : (
                <div
                  className="message-text"
                  // “Modernized” rendering only for bot replies
                  dangerouslySetInnerHTML={{ __html: formatBotText(chat.response) }}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={question}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          className="input-question"
        />
        <button type="submit" className="submit-button">Submit</button>
      </form>
      {/* <button onClick={handleLogout} className="logout-button">Logout</button> */}
    </div>
  );
};

export default Chatbot;