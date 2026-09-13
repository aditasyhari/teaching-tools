import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { SessionMemoryService } from './session-memory.service';
import { QuizRuntimeService } from './quiz-runtime.service';
import { PollRuntimeService } from './poll-runtime.service';
import { QuestionBoxRuntimeService } from './question-box-runtime.service';
import { RaiseHandRuntimeService } from './raise-hand-runtime.service';
import { BrainstormRuntimeService } from './brainstorm-runtime.service';
import { ExitTicketRuntimeService } from './exit-ticket-runtime.service';
import { ClassroomTimerRuntimeService } from './classroom-timer-runtime.service';
import { SessionsGateway } from './sessions.gateway';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { PollsModule } from '../polls/polls.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, QuizzesModule, PollsModule],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    SessionMemoryService,
    QuizRuntimeService,
    PollRuntimeService,
    QuestionBoxRuntimeService,
    RaiseHandRuntimeService,
    BrainstormRuntimeService,
    ExitTicketRuntimeService,
    ClassroomTimerRuntimeService,
    SessionsGateway,
  ],
  exports: [
    SessionsService,
    SessionMemoryService,
    QuizRuntimeService,
    PollRuntimeService,
    QuestionBoxRuntimeService,
    RaiseHandRuntimeService,
    BrainstormRuntimeService,
    ExitTicketRuntimeService,
    ClassroomTimerRuntimeService,
    SessionsGateway,
  ],
})
export class SessionsModule {}
