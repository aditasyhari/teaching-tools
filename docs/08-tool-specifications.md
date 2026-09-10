# 08 — Tool Specifications

Every tool must have:
- purpose
- entry state
- configuration
- main action
- participant behavior if applicable
- projector behavior if applicable
- completion state
- error/offline behavior
- analytics events

## Timer
Purpose: manage classroom time.
- countdown
- stopwatch
- presets
- pause/resume/reset
- fullscreen/projector
- local-first
- no backend required for standalone use

## Random Picker
Purpose: select a student/item fairly.
- source list
- shuffle
- pick
- exclude picked
- reset
- optional classroom roster
- local-first

## Group Maker
Purpose: create random groups.
- participant list
- number of groups or group size
- shuffle
- lock selected participant
- regenerate
- display/projector
- optional save result

## Scoreboard
Purpose: track team points during an activity.
- teams
- add/subtract points
- rename
- reset
- projector
- optional session persistence

## Live Quiz
- multiple choice
- true/false
- optional image
- question timer
- one response per participant per question
- server-authoritative scoring
- live response count
- reveal answer
- result/leaderboard
- teacher controls
- projector state

## Live Poll
- single/multiple choice
- optional anonymous display
- live aggregation
- teacher close/reopen
- projector result

## Raise Hand
- raise/lower
- teacher sees ordered queue
- teacher clears individual/all
- participant can see own state

## Question Box
- submit question
- moderation
- teacher selects/reveals
- answered state
- rate limiting and basic anti-spam

## Brainstorm Board
- short text response
- teacher moderation
- display grid/list
- optional anonymous presentation
- rate limit

## Word Cloud
- short text response
- normalization rules
- frequency aggregation
- profanity/abuse handling appropriate to product context
- projector rendering
- bounded response length

## Flashcards
- deck
- card front/back
- next/previous
- shuffle
- flip
- save/reuse
- can work locally for presentation

## Exit Ticket
- configurable short questions
- submit once
- completion state
- teacher summary
- export can be future enhancement

## Teacher Notes
- personal notes
- classroom notes
- quick note
- pin/search
- autosave with debouncing
- never expose private notes to students

## Tool contract
Each feature should expose a consistent interface to the Session Engine:
- activity type
- configuration schema
- initial state
- allowed teacher actions
- allowed participant actions
- reducer/state transition rules
- public/projector projection
- analytics events
