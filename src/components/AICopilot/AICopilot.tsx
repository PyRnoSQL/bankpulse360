import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any;
}

const AICopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: 'Hello! I\'m BankPulse AI Copilot. I can help you analyze banking data, generate reports, and answer questions. Try asking: "Show me loans overdue in the Bafoussam region" or "What are the top performing branches?"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [showData, setShowData] = useState<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processNaturalLanguageQuery = async (query: string) => {
    // Demo data for common queries - in production, this would call Claude API
    const demoResponses: Record<string, any> = {
      'loans overdue in the bafoussam region': {
        text: 'Here are the overdue loans in the Bafoussam region:',
        data: {
          type: 'table',
          columns: ['Loan ID', 'Customer', 'Amount (FCFA)', 'Days Overdue', 'Status'],
          rows: [
            ['LN-2024-001', 'Jean-Paul Kamga', '2,500,000', '45', 'Critical'],
            ['LN-2024-002', 'Marie Ngo Ngo', '1,800,000', '30', 'Serious'],
            ['LN-2024-003', 'Alain Djeumen', '3,200,000', '60', 'Critical'],
            ['LN-2024-004', 'Esther Mbarga', '950,000', '15', 'Watch'],
          ],
        },
      },
      'top performing branches': {
        text: 'Top performing branches by loan disbursement:',
        data: {
          type: 'table',
          columns: ['Branch', 'City', 'Loans (FCFA)', 'Growth %', 'Rating'],
          rows: [
            ['Douala Central', 'Douala', '850,000,000', '+23%', 'A+'],
            ['Yaoundé Omnisport', 'Yaoundé', '720,000,000', '+18%', 'A'],
            ['Bafoussam Main', 'Bafoussam', '450,000,000', '+15%', 'B+'],
            ['Garoua Branch', 'Garoua', '380,000,000', '+12%', 'B'],
          ],
        },
      },
      'fraud alerts': {
        text: 'Recent fraud alerts requiring attention:',
        data: {
          type: 'table',
          columns: ['Alert ID', 'Type', 'Risk Score', 'Amount', 'Status'],
          rows: [
            ['FR-2024-890', 'Unusual Pattern', '94%', '4,500,000', 'Investigating'],
            ['FR-2024-891', 'Location Anomaly', '87%', '2,300,000', 'Flagged'],
            ['FR-2024-892', 'Rapid Movement', '76%', '1,200,000', 'Review'],
          ],
        },
      },
    };

    const lowerQuery = query.toLowerCase();
    for (const [key, response] of Object.entries(demoResponses)) {
      if (lowerQuery.includes(key)) {
        return response;
      }
    }

    // Default response for unhandled queries
    return {
      text: `I understand you're asking about "${query}". For demo purposes, I can show you sample data. Try asking about "loans overdue", "top performing branches", or "fraud alerts".`,
      data: null,
    };
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Process the query
      const response = await processNaturalLanguageQuery(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.text,
        timestamp: new Date(),
        data: response.data,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setShowData(response.data);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          bgcolor: '#00ff88',
          color: '#040F0A',
          width: 56,
          height: 56,
          '&:hover': {
            bgcolor: '#00e676',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
        }}
      >
        <SmartToy />
      </IconButton>

      {/* Chat Window */}
      <Collapse in={isOpen}>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: { xs: 'calc(100% - 48px)', sm: 500 },
            height: 600,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'rgba(10, 25, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy sx={{ color: '#00ff88' }} />
              <Typography variant="h6">BankPulse AI Copilot</Typography>
              <Chip label="Demo" size="small" sx={{ bgcolor: '#00ff88', color: '#040F0A' }} />
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)}>
              <Close sx={{ color: 'white' }} />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  sx={{
                    maxWidth: '80%',
                    p: 1.5,
                    bgcolor: msg.type === 'user' ? '#00ff88' : 'rgba(255, 255, 255, 0.1)',
                    color: msg.type === 'user' ? '#040F0A' : 'white',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2">{msg.content}</Typography>
                  {msg.data && msg.data.type === 'table' && (
                    <Box sx={{ mt: 2 }}>
                      <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.5)' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {msg.data.columns.map((col: string) => (
                                <TableCell key={col} sx={{ color: '#00ff88', fontWeight: 'bold' }}>
                                  {col}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {msg.data.rows.map((row: any[], idx: number) => (
                              <TableRow key={idx}>
                                {row.map((cell, cellIdx) => (
                                  <TableCell key={cellIdx} sx={{ color: 'white' }}>
                                    {cell}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                    {msg.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Paper sx={{ p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.1)' }}>
                  <CircularProgress size={20} sx={{ color: '#00ff88' }} />
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 255, 136, 0.2)' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask me anything about your banking data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(0, 255, 136, 0.3)' },
                },
              }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSend} disabled={loading || !input.trim()}>
                    <Send sx={{ color: '#00ff88' }} />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Paper>
      </Collapse>
    </>
  );
};

export default AICopilot;
