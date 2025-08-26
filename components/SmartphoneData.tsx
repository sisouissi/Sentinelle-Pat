
import React from 'react';
import type { SmartphoneData as SmartphoneDataType } from '../types';
import { Footprints, BedDouble, Cloudy, Lungs, ClipboardList, Info } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface SummaryCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    cardClassName: string;
    titleClassName: string;
    iconClassName: string;
}

const SummaryCard = ({ title, icon, children, cardClassName, titleClassName, iconClassName }: SummaryCardProps) => (
    <div className={`p-3 rounded-lg flex flex-col gap-2 transition-colors duration-300 ${cardClassName}`}>
        <div className="flex items-center gap-2">
            <div className={iconClassName}>{icon}</div>
            <h4 className={`text-sm font-semibold ${titleClassName}`}>{title}</h4>
        </div>
        <div className="space-y-1.5">{children}</div>
    </div>
);

interface MetricProps {
    label: string;
    value: string | number;
    unit: string;
    isWarning?: boolean;
}

const Metric = ({ label, value, unit, isWarning }: MetricProps) => (
    <div className={`flex justify-between items-baseline text-xs ${isWarning ? 'text-yellow-700 font-semibold' : 'text-slate-600'}`}>
        <span className="truncate">{label}</span>
        <span className={`font-bold text-sm ${isWarning ? 'text-yellow-800' : 'text-slate-800'}`}>
            {value} <span className="text-xs font-normal">{unit}</span>
        </span>
    </div>
);

interface SmartphoneDataProps {
  data: SmartphoneDataType;
  isAiFilterActive: boolean;
}

export function SmartphoneData({ data, isAiFilterActive }: SmartphoneDataProps): React.ReactNode {
  const { t } = useTranslation();

  const getCardStyle = (warnings: boolean[]) => {
    if (!isAiFilterActive) {
      return {
        card: 'bg-slate-100/70',
        title: 'text-slate-700',
        icon: 'text-slate-500',
      };
    }
    const warningCount = warnings.filter(Boolean).length;
    if (warningCount >= 2) {
      return { // High concern
        card: 'bg-red-100 border border-red-300',
        title: 'text-red-800',
        icon: 'text-red-600',
      };
    }
    if (warningCount === 1) {
      return { // Medium concern
        card: 'bg-yellow-100 border border-yellow-300',
        title: 'text-yellow-800',
        icon: 'text-yellow-600',
      };
    }
    return { // Normal
      card: 'bg-green-100 border border-green-300',
      title: 'text-green-800',
      icon: 'text-green-600',
    };
  };

  const activityStyle = getCardStyle([
    data.activity.steps < 2000,
    data.activity.sedentaryMinutes > 300,
    data.activity.movementSpeedKmh < 2.5
  ]);
  
  const sleepStyle = getCardStyle([
    data.sleep.totalSleepHours < 6,
    data.sleep.sleepEfficiency < 80,
    data.sleep.nightMovements > 30
  ]);

  const coughStyle = getCardStyle([
    data.cough.coughFrequencyPerHour > 8,
    data.cough.nightCoughEpisodes > 5,
    data.cough.respiratoryRate > 20
  ]);

  const environmentStyle = getCardStyle([
    data.environment.airQualityIndex > 100,
    data.environment.homeTimePercent > 90
  ]);
  
  const reportedStyle = getCardStyle([
    data.reported.symptoms.breathlessness > 6,
    data.reported.qualityOfLife.CAT > 20,
    data.reported.medication.adherencePercent < 90
  ]);

  return (
    <div className="p-1 h-full flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 text-center mb-3">{t('smartphone.title')}</h3>
        
        <div className="mx-auto max-w-2xl bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-3 rounded-r-lg mb-3 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
                <span className="font-semibold">{t('smartphone.bestPractices.title')}</span>
                <ul className="list-disc list-inside mt-1">
                    <li>{t('smartphone.bestPractices.placement')}</li>
                    <li>{t('smartphone.bestPractices.dnd')}</li>
                    <li>{t('smartphone.bestPractices.airplane')}</li>
                </ul>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-2 pb-2">
            
            <SummaryCard
                title={t('smartphone.activity.title')}
                icon={<Footprints className="w-5 h-5" />}
                cardClassName={activityStyle.card}
                titleClassName={activityStyle.title}
                iconClassName={activityStyle.icon}
            >
                <Metric label={t('smartphone.activity.steps')} value={data.activity.steps.toLocaleString()} unit="" isWarning={data.activity.steps < 2000} />
                <Metric label={t('smartphone.activity.sedentaryTime')} value={data.activity.sedentaryMinutes} unit="min" isWarning={data.activity.sedentaryMinutes > 300} />
                <Metric label={t('smartphone.activity.walkingSpeed')} value={data.activity.movementSpeedKmh.toFixed(1)} unit="km/h" isWarning={data.activity.movementSpeedKmh < 2.5} />
            </SummaryCard>

            <SummaryCard
                title={t('smartphone.sleep.title')}
                icon={<BedDouble className="w-5 h-5" />}
                cardClassName={sleepStyle.card}
                titleClassName={sleepStyle.title}
                iconClassName={sleepStyle.icon}
            >
                <Metric label={t('smartphone.sleep.duration')} value={data.sleep.totalSleepHours.toFixed(1)} unit="h" isWarning={data.sleep.totalSleepHours < 6} />
                <Metric label={t('smartphone.sleep.efficiency')} value={data.sleep.sleepEfficiency} unit="%" isWarning={data.sleep.sleepEfficiency < 80} />
                 <Metric label={t('smartphone.sleep.nightMovements')} value={data.sleep.nightMovements} unit="" isWarning={data.sleep.nightMovements > 30} />
            </SummaryCard>

            <SummaryCard
                title={t('smartphone.cough.title')}
                icon={<Lungs className="w-5 h-5" />}
                cardClassName={coughStyle.card}
                titleClassName={coughStyle.title}
                iconClassName={coughStyle.icon}
            >
                <Metric label={t('smartphone.cough.frequency')} value={data.cough.coughFrequencyPerHour} unit="/h" isWarning={data.cough.coughFrequencyPerHour > 8} />
                <Metric label={t('smartphone.cough.nightEpisodes')} value={data.cough.nightCoughEpisodes} unit="" isWarning={data.cough.nightCoughEpisodes > 5} />
                 <Metric label={t('smartphone.cough.respiratoryRate')} value={data.cough.respiratoryRate} unit="rpm" isWarning={data.cough.respiratoryRate > 20} />
            </SummaryCard>

            <SummaryCard
                title={t('smartphone.environment.title')}
                icon={<Cloudy className="w-5 h-5" />}
                cardClassName={environmentStyle.card}
                titleClassName={environmentStyle.title}
                iconClassName={environmentStyle.icon}
            >
                <Metric label={t('smartphone.environment.airQuality')} value={data.environment.airQualityIndex} unit="IQA" isWarning={data.environment.airQualityIndex > 100} />
                <Metric label={t('smartphone.environment.homeTime')} value={data.environment.homeTimePercent} unit="%" isWarning={data.environment.homeTimePercent > 90} />
                 <Metric label={t('smartphone.environment.temperature')} value={data.environment.weather.temperatureC} unit="°C" />
            </SummaryCard>

            <SummaryCard
                title={t('smartphone.reported.title')}
                icon={<ClipboardList className="w-5 h-5" />}
                cardClassName={reportedStyle.card}
                titleClassName={reportedStyle.title}
                iconClassName={reportedStyle.icon}
            >
                <Metric label={t('smartphone.reported.breathlessness')} value={data.reported.symptoms.breathlessness} unit="/10" isWarning={data.reported.symptoms.breathlessness > 6} />
                <Metric label={t('smartphone.reported.catScore')} value={data.reported.qualityOfLife.CAT} unit="/40" isWarning={data.reported.qualityOfLife.CAT > 20} />
                <Metric label={t('smartphone.reported.adherence')} value={data.reported.medication.adherencePercent} unit="%" isWarning={data.reported.medication.adherencePercent < 90} />
            </SummaryCard>
        </div>
    </div>
  );
}