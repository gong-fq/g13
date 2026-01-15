// ==================== 主要聊天功能 - 优化版 ====================

// 发送消息函数 - 优化响应时间
async function sendMessage() {
    const userText = userInput.value.trim();
    if (!userText) {
        showStatus('请输入问题内容', 'error');
        return;
    }

    // 检测用户输入语言
    const userLanguage = detectUserLanguage(userText);
    
    addMessageToChat(userText, 'user');
    userInput.value = '';
    userInput.focus();
    
    typingIndicator.style.display = 'block';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 根据用户语言动态设置系统提示
    conversationHistory = [
        { role: "system", content: getSystemPrompt(userLanguage) }
    ];
    
    // 添加用户消息
    conversationHistory.push({ role: "user", content: userText });

    // 设置请求超时（8秒）
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时，请稍后重试')), 8000);
    });

    try {
        // 并行处理：同时显示"正在思考"和发送请求
        const responsePromise = fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: conversationHistory,
                max_tokens: 800, // 限制响应长度以加快速度
                temperature: 0.7,
                stream: false
            })
        });

        // 使用Promise.race实现超时控制
        const response = await Promise.race([responsePromise, timeoutPromise]);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API请求失败: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // 确保有响应内容
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('API返回格式错误');
        }
        
        const aiResponse = data.choices[0].message.content;

        // 记录AI回复的语言
        lastAiMessageLanguage = userLanguage; // AI回复语言与用户提问语言一致
        
        conversationHistory.push({ role: "assistant", content: aiResponse });
        const messageElement = addMessageToChat(aiResponse, 'ai');
        
        // 添加朗读按钮，使用对应的语言
        addTTSToMessage(messageElement, aiResponse, userLanguage);
        
        const successMsg = userLanguage === 'zh' ? 'AI回复已收到' : 'AI response received';
        showStatus(successMsg, 'success');

    } catch (error) {
        console.error('API请求错误:', error);
        
        let errorMsg = '请求失败，请稍后重试';
        if (error.message.includes('超时')) {
            errorMsg = '请求超时，请检查网络连接或稍后重试';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
            errorMsg = '网络连接失败，请检查网络';
        } else if (error.message.includes('API')) {
            errorMsg = '服务暂时不可用，请稍后重试';
        }
        
        const messageElement = addMessageToChat(`抱歉，暂时无法处理您的请求：${errorMsg}。请稍后再试或尝试其他问题。`, 'ai');
        addTTSToMessage(messageElement, `抱歉，暂时无法处理您的请求：${errorMsg}。请稍后再试或尝试其他问题。`, 'zh');
        showStatus(errorMsg, 'error');
    } finally {
        typingIndicator.style.display = 'none';
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// ==================== 初始加载优化 ====================

document.addEventListener('DOMContentLoaded', () => {
    // 预加载语音功能
    setTimeout(() => {
        // 检查语音识别支持
        const isSpeechSupported = checkSpeechRecognitionSupport();
        
        // 检查TTS支持
        if (checkTTSsupport()) {
            // 预加载语音列表
            speechSynthesis.getVoices();
            // 防止voiceschanged事件多次触发
            let voicesLoaded = false;
            speechSynthesis.onvoiceschanged = () => {
                if (!voicesLoaded) {
                    console.log('语音列表已预加载');
                    voicesLoaded = true;
                }
            };
        }
        
        // 延迟检查权限和初始化
        setTimeout(() => {
            checkMicrophonePermission();
            
            // 如果支持语音，尝试初始化
            if (isSpeechSupported) {
                initSpeechRecognition();
            }
        }, 500);
    }, 100);
    
    // 显示快速就绪状态
    setTimeout(() => {
        showStatus('Grammar Guru 已就绪，请开始提问！', 'success', 2000);
    }, 300);
});

// 改进的添加消息函数
function addMessageToChat(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'message-icon';
    iconDiv.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // 优化文本格式化，减少处理时间
    let formattedText = text;
    // 只处理必要的格式化
    formattedText = formattedText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    
    contentDiv.innerHTML = formattedText;
    messageDiv.appendChild(iconDiv);
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    // 使用requestAnimationFrame优化滚动性能
    requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
    
    if (sender === 'ai') {
        lastAiMessage = text;
    }
    
    return messageDiv;
}