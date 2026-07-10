# 🧪 Testing Guide - What to Expect

## Before Testing

1. **Restart Server**
   ```bash
   npm run dev:server
   ```
   
2. **Wait for Startup**
   - Look for: `Server running on port 5000`
   - Check console shows no errors
   - May take 5-10 seconds

3. **Verify API Key**
   - Check `.env` has `GEMINI_API_KEY=...`
   - Should have API key from Google AI Studio

---

## Test Scenario 1: Basic Chat ✅

### Steps
1. Open portfolio website
2. Click chat icon (bottom right)
3. Type: "What projects have you built?"
4. Press Shift+Enter or click send button

### Expected Results
```
✅ Chat window opens
✅ Welcome message appears
✅ Suggested questions visible
✅ Message sends successfully
✅ Typing indicator shows (bouncing dots)
✅ Response appears after 2-5 seconds
✅ Response includes specific project names
✅ **Bold text** appears in blue
✅ Links are clickable
✅ Message auto-scrolls into view
✅ Ready for next message
```

### Server Console Should Show
```
✓ Gemini API response received
```

---

## Test Scenario 2: Markdown Rendering ✅

### Steps
1. Send: "Tell me about your skills"

### Expected Results
```
✅ Response contains formatted text
✅ **Bold words** appear in blue
✅ `Code` appears in monospace
✅ [Links](url) are clickable
✅ Lists render properly
✅ Line breaks preserved
```

### Example Response
```
I'm proficient in **React**, **Node.js**, and **MongoDB`.

Core competencies:
- Frontend: React, Vue, JavaScript
- Backend: Node.js, Express
- Databases: MongoDB, PostgreSQL
```

---

## Test Scenario 3: Copy Button ✅

### Steps
1. Wait for response
2. Hover over AI's message
3. Look for 📋 button (top right of message)
4. Click the button

### Expected Results
```
✅ 📋 button visible on hover
✅ Button clicks successfully
✅ Changes to ✓
✅ Message copied to clipboard
✅ Can paste with Ctrl+V
✅ Button reverts to 📋 after 2 seconds
```

---

## Test Scenario 4: Keyboard Shortcuts ✅

### Steps A: Shift+Enter
1. Type message
2. Hold Shift + Press Enter

### Expected Results
```
✅ Message sends without clicking button
✅ Works from desktop keyboard
✅ Works from mobile keyboard
```

### Steps B: Escape Key
1. Press Escape while chat is open

### Expected Results
```
✅ Chat window closes
✅ Smooth slide-down animation
✅ Can reopen by clicking icon
```

---

## Test Scenario 5: Suggested Questions ✅

### Steps
1. Look at suggested questions (below welcome message)
2. Click one of the pills

### Expected Results
```
✅ Pill highlights on hover
✅ Smooth animation
✅ Question fills input field
✅ Message sends automatically
✅ AI responds to question
```

### Suggested Questions Should Include
```
- "What projects has Abinash built?"
- "What are your skills?"
- "How can I contact him?"
- "Tell me about Abinash"
```

---

## Test Scenario 6: Conversation Memory ✅

### Steps
1. Send: "What projects have you built?"
2. Wait for response
3. Send: "Tell me more about the first one"

### Expected Results
```
✅ AI remembers the projects
✅ Response refers to "first one"
✅ Context is maintained
✅ Related information provided
```

### Example
```
You: "What projects have you built?"
AI: "I've built projects like X, Y, Z..."

You: "Tell me more about the first one"
AI: "Project X is... [refers back to X]"
```

---

## Test Scenario 7: Error Handling ✅

### Steps A: Simulate Timeout
1. Open DevTools (F12)
2. Go to Network tab
3. Set throttling to "Slow 3G"
4. Send a message

### Expected Results
```
✅ Typing indicator shows
✅ Message says: "Request timed out..."
✅ Suggests trying again
✅ Can retry by sending again
```

### Steps B: Network Error
1. Disconnect internet
2. Try to send message

### Expected Results
```
✅ Error appears: "Connection error"
✅ Helpful message shown
✅ Suggests retrying
✅ Reconnect internet and retry works
```

---

## Test Scenario 8: Mobile Responsive ✅

### Steps
1. Open on mobile device (or use DevTools responsive mode)
2. Chat icon visible
3. Try all features

### Expected Results
```
✅ Chat fits on screen
✅ Buttons are touch-friendly
✅ Text readable
✅ Keyboard appears properly
✅ No overlapping elements
✅ Portrait and landscape work
✅ Smooth animations on mobile
```

### DevTools Responsive Sizes to Test
- iPhone 12 (390x844)
- iPad (768x1024)
- Android phone (375x812)
- Tablet (1024x768)

---

## Test Scenario 9: Multiple Turns ✅

### Conversation Example
```
You: "What technologies do you use?"
AI: "I primarily work with React, Node.js..."

You: "Do you have experience with TypeScript?"
AI: "Yes, I use TypeScript in all my..." [refers to context]

You: "How long have you been developing?"
AI: "Based on my experience..." [maintains context]
```

### Expected Results
```
✅ AI maintains context across messages
✅ Responses reference earlier points
✅ Conversation feels natural
✅ No repeated information
```

---

## Test Scenario 10: Different Question Types ✅

### Send These Questions

**Portfolio Questions**
```
✅ "What projects have you built?"
✅ "Show me your best work"
✅ "What's your tech stack?"
✅ "Do you work with React?"
✅ "Can you do freelance?"
```

**Personal Questions**
```
✅ "Tell me about yourself"
✅ "What's your experience?"
✅ "Where are you located?"
✅ "What are you learning?"
```

**Contact Questions**
```
✅ "How can I contact you?"
✅ "What's your email?"
✅ "Do you have a LinkedIn?"
✅ "Are you available now?"
```

**Unrelated Questions** (should still work)
```
✅ "What's 2+2?"
✅ "Tell me a joke"
✅ "How's the weather?"
✅ AI answers then redirects to portfolio
```

### Expected Results
```
✅ All questions get relevant responses
✅ Portfolio questions get specific answers
✅ Personal questions answered warmly
✅ Contact info provided clearly
✅ Unrelated questions answered but redirected
```

---

## Success Checklist

### Functionality
- [ ] Chat opens when clicking icon
- [ ] Welcome message displays
- [ ] Suggested questions visible
- [ ] Messages send successfully
- [ ] Typing indicator shows
- [ ] Responses appear
- [ ] Multiple turns work
- [ ] Keyboard shortcuts work (Shift+Enter, Escape)

### Formatting
- [ ] **Bold text** renders in blue
- [ ] `Code` appears monospace
- [ ] Links are clickable
- [ ] Line breaks work
- [ ] No formatting artifacts

### Features
- [ ] Copy button visible on hover
- [ ] Copy button works
- [ ] Suggested questions clickable
- [ ] Chat scrolls automatically
- [ ] Suggestions disappear after sending

### Error Handling
- [ ] Timeouts handled gracefully
- [ ] Network errors show helpful message
- [ ] Can retry after error
- [ ] Error messages are readable
- [ ] No crashes or console errors

### Mobile
- [ ] Works on small screens
- [ ] Buttons are touch-friendly
- [ ] Text readable
- [ ] Landscape orientation works
- [ ] Keyboard appears properly

### Performance
- [ ] Chat responds quickly
- [ ] No lag or stuttering
- [ ] Animations smooth
- [ ] No memory issues
- [ ] Works across many messages

---

## Troubleshooting

### Chat Not Opening
```
❌ Issue: Chat window doesn't appear
✅ Solution: 
   1. Refresh page (Ctrl+Shift+R)
   2. Check browser console (F12)
   3. Verify server running
```

### No Response from AI
```
❌ Issue: Send message but no response
✅ Solution:
   1. Check server is running
   2. Verify API key in .env
   3. Check network tab (F12)
   4. Look for error messages
```

### Markdown Not Rendering
```
❌ Issue: **Bold** shows as plain text
✅ Solution:
   1. Hard refresh browser (Ctrl+Shift+R)
   2. Clear browser cache
   3. Check CSS loaded (Inspect element)
   4. Check for console errors
```

### Copy Button Not Working
```
❌ Issue: Copy button doesn't copy
✅ Solution:
   1. Check browser permissions
   2. Try different browser
   3. Check console for errors
   4. Verify HTTPS or localhost
```

### Mobile Issues
```
❌ Issue: Chat overlaps or doesn't fit
✅ Solution:
   1. Try landscape orientation
   2. Zoom out if needed
   3. Clear browser cache
   4. Try different device
```

---

## Performance Expectations

### Response Times
```
Good: < 2 seconds
Normal: 2-5 seconds
Acceptable: 5-10 seconds
Slow: > 10 seconds (check connection)
```

### Quality Expectations
```
Portfolio questions: Specific, personalized answers
Context questions: Maintains conversation context
Formatting: Markdown renders properly
Errors: Helpful, actionable messages
Mobile: Smooth, responsive, touch-friendly
```

---

## What's Normal

✅ First message takes longer (startup time)  
✅ Subsequent messages faster  
✅ Typing indicator shows for 2-5 seconds  
✅ Bold text appears in different color  
✅ Auto-scrolling happens automatically  
✅ Copy button disappears after hover  
✅ Suggested questions appear once  

---

## What's NOT Normal

❌ Chat doesn't open  
❌ Typing indicator never goes away  
❌ Response is generic ("I'm here to help")  
❌ Error message every time  
❌ Browser crashes  
❌ Console shows red errors  
❌ Mobile view is broken  
❌ No markdown rendering  

---

## Need Help?

1. Check `QUICK_START_AI.md` for features
2. Check `AI_ASSISTANT_IMPROVEMENTS.md` for technical details
3. Review console for error messages (F12)
4. Restart server
5. Clear browser cache and reload
6. Check that API key is set

---

**Happy Testing! 🚀**

Report any issues or share successful tests. The AI should feel natural and helpful, like a professional assistant specializing in your portfolio.
