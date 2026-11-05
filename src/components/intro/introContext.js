import { createContext, useContext } from 'react'

// phase: 'pending' (blueprint shown, waiting a frame) → 'running' (agents building)
//        → 'handoff' (agent flying to the chatbot corner) → 'done'
export const IntroContext = createContext({
  phase: 'done',
  startedAt: null,
  skipped: false,
  skip: () => {},
  finishHandoff: () => {},
  replay: () => {},
})

export const useIntro = () => useContext(IntroContext)
