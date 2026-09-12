import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableChartIcon from '@mui/icons-material/TableChart';
import StorageIcon from '@mui/icons-material/Storage';
import CodeIcon from '@mui/icons-material/Code';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HttpIcon from '@mui/icons-material/Http';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TransformIcon from '@mui/icons-material/Transform';
import FilterListIcon from '@mui/icons-material/FilterList';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import UpdateIcon from '@mui/icons-material/Update';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';
import LayersIcon from '@mui/icons-material/Layers';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import RuleIcon from '@mui/icons-material/Rule';
import TokenIcon from '@mui/icons-material/Token';
import ApiIcon from '@mui/icons-material/Api';
import TerminalIcon from '@mui/icons-material/Terminal';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import FlagIcon from '@mui/icons-material/Flag';
import HistoryIcon from '@mui/icons-material/History';
import BuildIcon from '@mui/icons-material/Build';
import HelpIcon from '@mui/icons-material/Help';

interface AppIconProps {
  name: string;
  className?: string;
  fontSize?: 'small' | 'inherit' | 'medium' | 'large';
  style?: React.CSSProperties;
}

const iconMap: Record<string, React.ElementType> = {
  Dashboard: DashboardIcon,
  TableChart: TableChartIcon,
  Storage: StorageIcon,
  Code: CodeIcon,
  MonetizationOn: MonetizationOnIcon,
  Http: HttpIcon,
  AdminPanelSettings: AdminPanelSettingsIcon,
  ViewColumn: ViewColumnIcon,
  ContentCut: ContentCutIcon,
  CompareArrows: CompareArrowsIcon,
  Transform: TransformIcon,
  FilterList: FilterListIcon,
  PlaylistAdd: PlaylistAddIcon,
  Update: UpdateIcon,
  DataObject: DataObjectIcon,
  FindReplace: FindReplaceIcon,
  EnhancedEncryption: EnhancedEncryptionIcon,
  Layers: LayersIcon,
  FactCheck: FactCheckIcon,
  Rule: RuleIcon,
  Token: TokenIcon,
  Api: ApiIcon,
  Terminal: TerminalIcon,
  People: PeopleIcon,
  Security: SecurityIcon,
  Flag: FlagIcon,
  History: HistoryIcon,
  Build: BuildIcon,
  Help: HelpIcon,
};

export const AppIcon: React.FC<AppIconProps> = ({ name, className, fontSize = 'small', style }) => {
  const IconComponent = iconMap[name] || BuildIcon;
  return <IconComponent className={className} fontSize={fontSize} style={style} />;
};
