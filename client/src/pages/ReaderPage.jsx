import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReaderTopBar from '../components/reader/ReaderTopBar'
import PDFUploadZone from '../components/reader/PDFUploadZone'
import PDFViewer from '../components/reader/PDFViewer'
import DefinitionPopup from '../components/reader/DefinitionPopup'
import DefinitionPanel from '../components/reader/DefinitionPanel'
import ApiKeyModal from '../components/reader/ApiKeyModal'
import { useContextDefinition } from '../hooks/useContextDefinition'
import { useAuth } from '../context/AuthContext'
import { usePaperHistory } from '../hooks/usePaperHistory'
import { useTransition } from '../context/TransitionContext'
import { useApiKeys } from '../hooks/useApiKeys'

const DEFAULT_OPENROUTER_MODEL = 'openai/gpt-4o'
const MAX_HISTORY = 50 // higher cap since history is persisted

export default function ReaderPage() {
  const [pdfFile, setPdfFile] = useState(null)
  const [provider, setProvider] = useState('openrouter')
  const [openRouterModel, setOpenRouterModel] = useState(DEFAULT_OPENROUTER_MODEL)
  const [history, setHistory] = useState([])
  const [historyViewKey, setHistoryViewKey] = useState(null)
  const [panelFollowUpQuestion, setPanelFollowUpQuestion] = useState(null)
  const pendingPageNumberRef = useRef(1)
  const pendingContextRef = useRef(null)
  const pendingFollowUpKeyRef = useRef(null)
  const pendingFollowUpQuestionRef = useRef(null)
  const scrollToPageRef = useRef(null)

  const { isAuthenticated } = useAuth()
  const { pageState } = useTransition()
  const { getKey, setKey, hasKey } = useApiKeys()
  const [keyModalOpen, setKeyModalOpen] = useState(false)
  const { initSession, loadSessionLookups, saveLookup, updateLookupFollowUps, fetchAllSessions } = usePaperHistory()
  // Stable refs so backend calls inside useEffects never stale-close over callbacks
  const backendRef = useRef({ isAuthenticated, initSession, loadSessionLookups, saveLookup, updateLookupFollowUps })
  useEffect(() => {
    backendRef.current = { isAuthenticated, initSession, loadSessionLookups, saveLookup, updateLookupFollowUps }
  })

  // Past sessions shown in the upload zone for signed-in users
  const [readerSessions, setReaderSessions] = useState([])
  useEffect(() => {
    if (!isAuthenticated) return
    fetchAllSessions().then(setReaderSessions)
  }, [isAuthenticated, fetchAllSessions])

  // Resume a past session: preload its lookups so the sidebar is ready when PDF is uploaded
  const handleResumeSession = useCallback(async (session) => {
    const { initSession: init, loadSessionLookups: loadLookups } = backendRef.current
    let sessionId = session._id
    if (!sessionId) {
      const created = await init(session.documentTitle)
      sessionId = created?._id
    }
    if (!sessionId) return
    const past = await loadLookups(sessionId)
    if (past.length > 0) setHistory(past)
  }, [])

  const { state, popupAnchor, fetchDefinition, sendFollowUpForHistory, clearDefinition } =
    useContextDefinition()

  const model = provider === 'openrouter' || provider === 'openai' ? openRouterModel : undefined
  const documentTitle = pdfFile?.name ?? 'Unknown document'

  // When a PDF is loaded (or on mount with a preloaded session from pageState),
  // fetch the user's past lookups for this document from the backend.
  useEffect(() => {
    const { isAuthenticated: auth, initSession: init, loadSessionLookups: loadLookups } = backendRef.current
    if (!auth) return

    const title = pdfFile?.name ?? pageState?.documentTitle
    const preloadedSessionId = !pdfFile ? pageState?.sessionId : null

    if (!title && !preloadedSessionId) return

    async function loadHistory() {
      let sessionId = preloadedSessionId
      if (!sessionId) {
        const session = await init(title)
        sessionId = session?._id
      }
      if (!sessionId) return
      const past = await loadLookups(sessionId)
      if (past.length > 0) setHistory(past)
    }

    loadHistory()
  }, [pdfFile, pageState]) // eslint-disable-line react-hooks/exhaustive-deps

  // Add to history when a lookup succeeds; also sync to backend when authenticated
  useEffect(() => {
    if (state.status !== 'success' || !state.highlighted || !state.explanation) return

    const followUpKey = pendingFollowUpKeyRef.current
    if (followUpKey) {
      // Completed follow-up for an existing history item
      const question = pendingFollowUpQuestionRef.current
      pendingFollowUpKeyRef.current = null
      pendingFollowUpQuestionRef.current = null
      setHistory((prev) => {
        const updated = prev.map((item) =>
          item.highlighted === followUpKey
            ? { ...item, followUps: [...(item.followUps || []), { question, answer: state.explanation }] }
            : item,
        )
        // Sync follow-ups to backend
        const updatedItem = updated.find((i) => i.highlighted === followUpKey)
        if (updatedItem?.lookupId) {
          backendRef.current.updateLookupFollowUps(updatedItem.lookupId, updatedItem.followUps)
        }
        return updated
      })
      setPanelFollowUpQuestion(null)
      return
    }

    // New lookup
    const newItem = {
      highlighted: state.highlighted,
      explanation: state.explanation,
      pageNumber: pendingPageNumberRef.current,
      surrounding: pendingContextRef.current?.surrounding ?? '',
      documentTitle: pendingContextRef.current?.documentTitle ?? '',
      provider: pendingContextRef.current?.provider ?? 'openrouter',
      model: pendingContextRef.current?.model,
      followUps: [],
    }

    setHistory((prev) => {
      if (prev[0]?.highlighted === state.highlighted) return prev
      return [newItem, ...prev].slice(0, MAX_HISTORY)
    })

    // Save to backend and store the returned _id on the history item
    const { isAuthenticated: auth, saveLookup: save } = backendRef.current
    if (auth) {
      save({
        highlighted: newItem.highlighted,
        explanation: newItem.explanation,
        pageNumber: newItem.pageNumber,
        surrounding: newItem.surrounding,
        provider: newItem.provider,
        model: newItem.model,
      }).then((saved) => {
        if (saved?._id) {
          setHistory((prev) =>
            prev.map((item) =>
              item.highlighted === newItem.highlighted && !item.lookupId
                ? { ...item, lookupId: saved._id }
                : item,
            ),
          )
        }
      })
    }
  }, [state.status, state.highlighted, state.explanation])

  const handleTextSelect = useCallback(
    ({ highlighted, surrounding, pageNumber, anchor }) => {
      setHistoryViewKey(null)
      pendingPageNumberRef.current = pageNumber
      pendingContextRef.current = { surrounding, documentTitle, provider, model }
      fetchDefinition({
        highlighted,
        surrounding,
        documentTitle,
        pageNumber,
        provider,
        model,
        apiKey: getKey(provider),
        anchor,
      })
    },
    [documentTitle, provider, model, fetchDefinition, getKey],
  )

  const handleClosePopup = useCallback(() => {
    clearDefinition()
    setHistoryViewKey(null)
  }, [clearDefinition])

  const handlePanelFollowUp = useCallback(
    (question) => {
      if (!historyViewKey) return
      const item = history.find((h) => h.highlighted === historyViewKey)
      if (!item) return
      pendingFollowUpKeyRef.current = historyViewKey
      pendingFollowUpQuestionRef.current = question
      setPanelFollowUpQuestion(question)
      sendFollowUpForHistory(item, question)
    },
    [historyViewKey, history, sendFollowUpForHistory],
  )

  const handleHistorySelect = useCallback((item) => {
    setHistoryViewKey(item.highlighted)
    if (scrollToPageRef.current && item.pageNumber) {
      scrollToPageRef.current(item.pageNumber, item.highlighted)
    }
  }, [])

  const handleUploadNew = useCallback(() => {
    setPdfFile(null)
    clearDefinition()
    setHistory([])
    setHistoryViewKey(null)
  }, [clearDefinition])

  // Panel only shows history — live streaming stays in the popup only
  const historyViewItem = historyViewKey
    ? history.find((h) => h.highlighted === historyViewKey) ?? null
    : null

  const liveFollowUp =
    panelFollowUpQuestion && (state.status === 'loading' || state.status === 'streaming')
      ? { question: panelFollowUpQuestion, answer: state.explanation, status: state.status }
      : null

  const panelState = historyViewItem
    ? {
        status: 'success',
        highlighted: historyViewItem.highlighted,
        explanation: historyViewItem.explanation,
        followUps: historyViewItem.followUps || [],
        error: null,
      }
    : { status: 'idle', highlighted: '', explanation: '', followUps: [], error: null }

  const panelVisible = history.length > 0

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-base)',
        overflow: 'hidden',
      }}
    >
      <ReaderTopBar
        fileName={pdfFile?.name}
        provider={provider}
        setProvider={setProvider}
        openRouterModel={openRouterModel}
        setOpenRouterModel={setOpenRouterModel}
        onUploadNew={handleUploadNew}
        hasKeyForProvider={hasKey(provider)}
        onOpenKeyModal={() => setKeyModalOpen(true)}
      />

      {keyModalOpen && (
        <ApiKeyModal
          provider={provider}
          currentKey={getKey(provider)}
          onSave={setKey}
          onClose={() => setKeyModalOpen(false)}
        />
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ── Left: PDF area ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRight: '1px solid var(--border-subtle)',
          }}
        >
          {!pdfFile ? (
            <PDFUploadZone
            onUpload={setPdfFile}
            sessions={readerSessions}
            onResumeSession={handleResumeSession}
          />
          ) : (
            <PDFViewer file={pdfFile} onTextSelect={handleTextSelect} scrollToPageRef={scrollToPageRef} />
          )}
        </div>

        {/* ── Right: Definition panel (always reserved space) ── */}
        <motion.aside
          initial={false}
          style={{
            width: 320,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-surface)',
            overflow: 'hidden',
            borderLeft: '1px solid var(--border-subtle)',
          }}
        >
          <DefinitionPanel
            state={panelState}
            history={history}
            onSelectHistory={handleHistorySelect}
            onFollowUp={handlePanelFollowUp}
            liveFollowUp={liveFollowUp}
          />
        </motion.aside>
      </div>

      {/* ── Floating definition popup ── */}
      <AnimatePresence>
        {popupAnchor && state.status !== 'idle' && (
          <DefinitionPopup
            key={state.highlighted}
            anchor={popupAnchor}
            highlighted={state.highlighted}
            status={state.status}
            explanation={state.explanation}
            error={state.error}
            onClose={handleClosePopup}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
