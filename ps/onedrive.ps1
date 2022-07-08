$PATHS=$args[0]

Unblock-File -Path .\ps\OneDriveLib.dll

Import-Module .\ps\OneDriveLib.dll


<# $RESULT = Get-ODStatus -OnDemandOnly
write-host "$RESULT" #>

Get-ODStatus
